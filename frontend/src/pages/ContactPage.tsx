import emailjs from "@emailjs/browser"
import { useEffect, useState, type FormEvent } from "react"
import SiteLayout from "../components/SiteLayout"
import SectionDivider from "../components/SectionDivider"
import { Link } from "react-router-dom"

const contactEmail = "krishnaxchoy@gmail.com"

export default function ContactPage() {
  const [submissionState, setSubmissionState] =
    useState<"idle" | "sending" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [statusVisible, setStatusVisible] = useState(true)

  useEffect(() => {
    if (submissionState !== "success") return

    const fadeTimeout = window.setTimeout(() => setStatusVisible(false), 8000)
    const clearTimeoutId = window.setTimeout(() => {
      setStatusMessage("")
      setSubmissionState("idle")
      setStatusVisible(true)
    }, 8500)

    return () => {
      window.clearTimeout(fadeTimeout)
      window.clearTimeout(clearTimeoutId)
    }
  }, [submissionState])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      setSubmissionState("error")
      setStatusMessage(
        "The contact form is not configured yet. Please email me directly using the address below.",
      )
      return
    }

    const formData = new FormData(form)
    const templateParams = {
      from_name: String(formData.get("name")),
      reply_to: String(formData.get("email")),
      subject: String(formData.get("subject")),
      message: String(formData.get("message")),
    }

    setSubmissionState("sending")
    setStatusMessage("")
    setStatusVisible(true)

    try {
      await emailjs.send(serviceId, templateId, templateParams, { publicKey })
      setSubmissionState("success")
      setStatusMessage("Your message has been sent. Thanks for reaching out!")
      form.reset()
    } catch (error) {
      console.error("EmailJS could not send the contact form message.", error)
      setSubmissionState("error")
      setStatusMessage(
        "Your message could not be sent. Please try again or email me directly.",
      )
    }
  }

  return (
    <SiteLayout active="contact">
      <main>
        <section className="mx-auto w-full max-w-[858px] px-6 pt-10 pb-6 md:px-0 md:pt-[46px] md:pb-6">
          <Link
            className="font-heebo-medium text-[16px] text-[#00a8cc] hover:underline"
            to="/"
          >
            ← Back to home
          </Link>
          <div className="mt-8 max-w-[650px]">
            <p className="font-heebo-medium text-[16px] uppercase tracking-[0.18em] text-[#ff6464]">
              Get in touch
            </p>
            <h1 className="font-heebo-bold mt-2 text-[44px] leading-tight text-[#21243d] md:text-[52px] dark:text-[#f8fafc]">
              Contact
            </h1>
            <p className="font-heebo-regular mt-5 text-[18px] leading-[1.65] text-[#21243d] dark:text-[#cbd5e1]">
              Have a question or want to work together? Send me a message using
              the form below, or use the social links in the footer.
            </p>
          </div>
        </section>

        <SectionDivider />

        <section className="mx-auto min-h-[calc(100vh-252px)] w-full max-w-[858px] px-6 pt-8 pb-14 md:px-0 md:pt-12 md:pb-16">
          <form
            className="grid max-w-[650px] gap-5 border-2 border-[#21243d] bg-white/80 p-5 shadow-[6px_6px_0_#00a8cc] sm:p-8 dark:border-[#94a3b8] dark:bg-[#111c2e]/80 dark:shadow-[6px_6px_0_#0e7490]"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#cbd5e1] pb-4 dark:border-[#334155]">
              <p className="font-heebo-bold text-[12px] tracking-[0.16em] text-[#64748b] uppercase dark:text-[#94a3b8]">
                Message console <span className="text-[#ff6464]">/ 01</span>
              </p>
              <div aria-hidden="true" className="flex gap-1">
                <span className="h-2.5 w-2.5 bg-[#ff6464]" />
                <span className="h-2.5 w-2.5 bg-[#00a8cc]" />
                <span className="h-2.5 w-2.5 bg-[#21243d] dark:bg-[#94a3b8]" />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="font-heebo-medium grid gap-2 text-[15px] text-[#21243d] dark:text-[#e2e8f0]">
                Your name
                <input
                  autoComplete="name"
                  className="font-heebo-regular border-2 border-[#cbd5e1] bg-white px-4 py-3 text-[16px] text-[#21243d] outline-none transition focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/20 dark:border-[#475569] dark:bg-[#1f2a44] dark:text-[#f8fafc]"
                  name="name"
                  required
                />
              </label>
              <label className="font-heebo-medium grid gap-2 text-[15px] text-[#21243d] dark:text-[#e2e8f0]">
                Email address
                <input
                  autoComplete="email"
                  className="font-heebo-regular border-2 border-[#cbd5e1] bg-white px-4 py-3 text-[16px] text-[#21243d] outline-none transition focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/20 dark:border-[#475569] dark:bg-[#1f2a44] dark:text-[#f8fafc]"
                  name="email"
                  required
                  type="email"
                />
              </label>
            </div>
            <label className="font-heebo-medium grid gap-2 text-[15px] text-[#21243d] dark:text-[#e2e8f0]">
              Subject
              <input
                className="font-heebo-regular border-2 border-[#cbd5e1] bg-white px-4 py-3 text-[16px] text-[#21243d] outline-none transition focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/20 dark:border-[#475569] dark:bg-[#1f2a44] dark:text-[#f8fafc]"
                name="subject"
                required
              />
            </label>
            <label className="font-heebo-medium grid gap-2 text-[15px] text-[#21243d] dark:text-[#e2e8f0]">
              Message
              <textarea
                className="font-heebo-regular min-h-36 resize-y border-2 border-[#cbd5e1] bg-white px-4 py-3 text-[16px] text-[#21243d] outline-none transition focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/20 dark:border-[#475569] dark:bg-[#1f2a44] dark:text-[#f8fafc]"
                name="message"
                required
                rows={5}
              />
            </label>
            <button
              className="font-heebo-bold w-fit cursor-pointer border-2 border-[#21243d] bg-[#ff6464] px-5 py-3 text-[15px] tracking-wide text-white transition-colors hover:bg-[#e95454] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6464] disabled:cursor-wait disabled:opacity-65 dark:border-[#94a3b8]"
              disabled={submissionState === "sending"}
              type="submit"
            >
              {submissionState === "sending" ? "Sending..." : "Send message"}
            </button>
            {statusMessage && (
              <p
                aria-live="polite"
                className={`font-heebo-regular text-[14px] transition-opacity duration-500 ${
                  statusVisible ? "opacity-100" : "opacity-0"
                } ${
                  submissionState === "error"
                    ? "text-[#b91c1c] dark:text-[#fca5a5]"
                    : "text-[#166534] dark:text-[#86efac]"
                }`}
                role={submissionState === "error" ? "alert" : "status"}
              >
                {statusMessage}
              </p>
            )}
            <p className="font-heebo-regular flex flex-wrap items-center gap-x-1 text-[14px] text-[#64748b] dark:text-[#94a3b8]">
              You can also email me directly at{" "}
              <svg
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-[#00a8cc]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>{" "}
              <a
                className="text-[#00a8cc] hover:underline"
                href={`mailto:${contactEmail}`}
              >
                {contactEmail}
              </a>
              .
            </p>
          </form>
        </section>
      </main>
    </SiteLayout>
  )
}
