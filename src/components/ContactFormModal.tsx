import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type ContactFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FORMSUBMIT_EMAIL_ENDPOINT = "https://formsubmit.co/mitcel258@gmail.com";
const FORMSUBMIT_IFRAME_NAME = "formsubmit_hidden_target";

type FormValues = {
  name: string;
  email: string;
  message: string;
};

function ensureHiddenIframe(): HTMLIFrameElement {
  let iframe = document.getElementById(FORMSUBMIT_IFRAME_NAME) as HTMLIFrameElement | null;

  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.name = FORMSUBMIT_IFRAME_NAME;
    iframe.id = FORMSUBMIT_IFRAME_NAME;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }

  return iframe;
}

function submitViaHiddenForm(values: FormValues): void {
  ensureHiddenIframe();

  const form = document.createElement("form");
  form.action = FORMSUBMIT_EMAIL_ENDPOINT;
  form.method = "POST";
  form.target = FORMSUBMIT_IFRAME_NAME;
  form.style.display = "none";

  const fields: Record<string, string> = {
    name: values.name,
    email: values.email,
    message: values.message,
    _subject: `Portfolio contact from ${values.name || "Website visitor"}`,
    _captcha: "false",
    _template: "table"
  };

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();

  window.setTimeout(() => {
    form.remove();
  }, 500);
}

function ContactFormModal({ isOpen, onClose }: ContactFormModalProps) {
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(false);
    setIsSubmitted(false);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);

      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [isOpen, onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (isSubmitting || isSubmitted) {
      return;
    }

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    const values: FormValues = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim()
    };

    setIsSubmitting(true);

    try {
      submitViaHiddenForm(values);

      window.setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        formElement.reset();

        closeTimerRef.current = window.setTimeout(() => {
          onClose();
        }, 1500);
      }, 600);
    } catch {
      setIsSubmitting(false);
      setSubmitError("Failed to send right now. Please write to mitcel258@gmail.com");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] bg-black/70 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-[8vh] w-full max-w-xl rounded-3xl border border-white/15 bg-[#0b0f13]/95 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#5ed29c]">Contact Form</p>
                <h3 className="text-2xl font-semibold text-white">Let's build something great</h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:text-white"
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                name="name"
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#5ed29c]"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#5ed29c]"
              />
              <textarea
                name="message"
                rows={5}
                required
                placeholder="Tell me about your project"
                className="w-full resize-none rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#5ed29c]"
              />

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className="inline-flex items-center gap-2 rounded-full bg-[#5ed29c] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#070b0a] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Sending..." : isSubmitted ? "Sent" : "Send Message"}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <a
                  href="https://www.linkedin.com/in/mitch-klu/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs uppercase tracking-[0.16em] text-white/70 transition-colors hover:text-[#5ed29c]"
                >
                  LinkedIn
                </a>

                <a
                  href="https://github.com/termenator46"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs uppercase tracking-[0.16em] text-white/70 transition-colors hover:text-[#5ed29c]"
                >
                  GitHub
                </a>
              </div>

              {isSubmitted ? (
                <p className="text-xs text-emerald-300">Thanks! Message sent. I will get back to you soon.</p>
              ) : null}

              {submitError ? <p className="text-xs text-amber-300">{submitError}</p> : null}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ContactFormModal;
