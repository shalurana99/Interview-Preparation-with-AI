const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/aiServices")
const interviewReportModel = require("../models/interviewReportModel")


/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const { selfDescription, jobDescription } = req.body

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })

    console.log("AI RESPONSE:")
    console.log(JSON.stringify(interViewReportByAi, null, 2))

    let technicalQuestions = (interViewReportByAi?.technicalQuestions || []).map((item) => {
    if (typeof item === "string") {
        return {
            question: item,
            intention: "Technical knowledge assessment",
            answer: "Provide a detailed technical explanation"
        }
    }
    return item
})

let behavioralQuestions = (interViewReportByAi?.behavioralQuestions || []).map((item) => {
    if (typeof item === "string") {
        return {
            question: item,
            intention: "Behavioral assessment",
            answer: "Answer using STAR method"
        }
    }
    return item
})

let skillGaps = (interViewReportByAi?.skillGaps || []).map((item) => {
    if (typeof item === "string") {
        return {
            skill: item,
            severity: "medium"
        }
    }
    return item
})

let preparationPlan = (interViewReportByAi?.preparationPlan || []).map((item, index) => {
    if (typeof item === "string") {
        return {
            day: index + 1,
            focus: item,
            tasks: [item]
        }
    }
    return item
})

    // fallback if AI gives wrong structure
    if (
        Array.isArray(interViewReportByAi?.interview_report) ||
        technicalQuestions.length === 0
    ) {
        technicalQuestions = [
            {
                question: "Explain Node.js event loop",
                intention: "Check backend fundamentals",
                answer: "Explain async event-driven architecture and event loop working"
            },
            {
                question: "How does JWT authentication work?",
                intention: "Check authentication knowledge",
                answer: "Explain token creation, verification, expiration, and middleware usage"
            },
            {
                question: "Difference between SQL and NoSQL databases?",
                intention: "Check database understanding",
                answer: "Compare relational vs document-based databases with examples"
            },
            {
                question: "How do you optimize API performance?",
                intention: "Check backend optimization skills",
                answer: "Discuss caching, indexing, async processing, connection pooling"
            },
            {
                question: "Explain REST API status codes",
                intention: "Check API fundamentals",
                answer: "Explain common codes like 200, 201, 400, 401, 404, 500"
            }
        ]
    }

    if (
        Array.isArray(interViewReportByAi?.interview_report) ||
        behavioralQuestions.length === 0
    ) {
        behavioralQuestions = [
            {
                question: "Tell me about a challenging project you handled",
                intention: "Assess problem solving",
                answer: "Use STAR method to explain challenge, action, and outcome"
            },
            {
                question: "How do you handle tight deadlines?",
                intention: "Assess time management",
                answer: "Explain prioritization and communication strategy"
            },
            {
                question: "How do you handle disagreements in a team?",
                intention: "Assess collaboration skills",
                answer: "Describe professional conflict resolution"
            }
        ]
    }

    if (
        Array.isArray(interViewReportByAi?.interview_report) ||
        skillGaps.length === 0
    ) {
        skillGaps = [
            {
                skill: "System Design",
                severity: "medium"
            },
            {
                skill: "Cloud Deployment",
                severity: "medium"
            },
            {
                skill: "Scalability Architecture",
                severity: "high"
            }
        ]
    }

    if (
        Array.isArray(interViewReportByAi?.interview_report) ||
        preparationPlan.length === 0
    ) {
        preparationPlan = [
            {
                day: 1,
                focus: "Node.js fundamentals",
                tasks: ["Event loop", "Async/await", "Streams"]
            },
            {
                day: 2,
                focus: "Database concepts",
                tasks: ["SQL joins", "Indexes", "MongoDB basics"]
            },
            {
                day: 3,
                focus: "Authentication and Security",
                tasks: ["JWT", "OAuth", "Sessions"]
            },
            {
                day: 4,
                focus: "API Design",
                tasks: ["REST APIs", "Validation", "Error handling"]
            },
            {
                day: 5,
                focus: "System Design",
                tasks: ["Caching", "Load balancing", "Scalability"]
            }
        ]
    }

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,

        title:
            interViewReportByAi?.title ||
            interViewReportByAi?.positionApplied ||
            "Interview Position",

        matchScore:
            interViewReportByAi?.matchScore ||
            interViewReportByAi?.match_score ||
            interViewReportByAi?.interviewScore ||
            70,

        technicalQuestions,
        behavioralQuestions,
        skillGaps,
        preparationPlan
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })
}


/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({
        _id: interviewId,
        user: req.user.id
    })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({
        user: req.user.id
    })
        .sort({ createdAt: -1 })
        .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({
        resume,
        jobDescription,
        selfDescription
    })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}