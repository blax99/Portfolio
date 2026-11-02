import { useState, type FormEvent, type ReactNode } from "react"
import type {
  BlogPost,
  AboutProfile,
  DailyThought,
  Skill,
  WorkProject,
} from "../../types/content"
import {
  adminRequest,
  getErrorMessage,
  type BlogInput,
  type AboutProfileInput,
  type DailyThoughtInput,
  type SkillInput,
  type WorkInput,
} from "./adminApi"

interface FieldProps {
  label: string
  children: ReactNode
}

function Field({ label, children }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="font-heebo-medium text-[13px] text-[#475569] dark:text-[#cbd5e1]">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputClassName =
  "font-heebo-regular min-h-11 w-full rounded-lg border border-[#d8dee8] bg-white px-3 py-2 text-[14px] text-[#21243d] outline-none transition focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/20 dark:border-[#475569] dark:bg-[#16213b] dark:text-[#f8fafc]"

function TextInput({
  label,
  value,
  onChange,
  required = true,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  type?: string
}) {
  return (
    <Field label={label}>
      <input
        className={inputClassName}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </Field>
  )
}

function TextArea({
  label,
  value,
  onChange,
  required = true,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  rows?: number
}) {
  return (
    <Field label={label}>
      <textarea
        className={`${inputClassName} resize-y`}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        rows={rows}
        value={value}
      />
    </Field>
  )
}

function EditorActions({
  saving,
  savingLabel = "Saving…",
  onCancel,
}: {
  saving: boolean
  savingLabel?: string
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-[#e5e5ea] pt-5 sm:flex-row sm:justify-end dark:border-[#334155]">
      <button
        className="font-heebo-medium rounded-lg border border-[#d8dee8] px-5 py-2.5 text-[14px] text-[#475569] transition hover:bg-[#f8fafc] dark:border-[#475569] dark:text-[#e2e8f0] dark:hover:bg-[#263552]"
        onClick={onCancel}
        type="button"
      >
        Cancel
      </button>
      <button
        className="font-heebo-bold rounded-lg bg-[#ff6464] px-5 py-2.5 text-[14px] text-white transition hover:bg-[#e95454] disabled:opacity-60"
        disabled={saving}
        type="submit"
      >
        {saving ? savingLabel : "Save changes"}
      </button>
    </div>
  )
}

export function WorkEntryForm({
  item,
  saving,
  onSave,
  onCancel,
}: {
  item: WorkProject | null
  saving: boolean
  onSave: (input: WorkInput) => void
  onCancel: () => void
}) {
  const [number, setNumber] = useState(item?.number ?? "")
  const [title, setTitle] = useState(item?.title ?? "")
  const [image, setImage] = useState(item?.image ?? "")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUploadError, setImageUploadError] = useState("")
  const [category, setCategory] = useState(item?.category ?? "")
  const [year, setYear] = useState(item?.year ?? "")
  const [featured, setFeatured] = useState(item?.featured ?? false)
  const [summary, setSummary] = useState(item?.summary ?? "")
  const [technologies, setTechnologies] = useState(
    item?.technologies.join(", ") ?? "",
  )
  const [highlights, setHighlights] = useState(
    item?.highlights.join("\n") ?? "",
  )

  async function uploadImage(file: File) {
    setImageUploadError("")
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("Image files must be 5 MB or smaller.")
      return
    }

    const formData = new FormData()
    formData.append("image", file)
    setUploadingImage(true)
    try {
      const uploaded = await adminRequest<{ image: string }>("/api/uploads", {
        method: "POST",
        body: formData,
      })
      setImage(uploaded.image)
    } catch (uploadError) {
      setImageUploadError(getErrorMessage(uploadError))
    } finally {
      setUploadingImage(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      ...(number.trim() ? { number: number.trim() } : {}),
      title: title.trim(),
      image: image.trim(),
      category: category.trim(),
      year: year.trim(),
      featured,
      summary: summary.trim(),
      technologies: technologies
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      highlights: highlights
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean),
    })
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Project title" onChange={setTitle} value={title} />
        <TextInput label="Category" onChange={setCategory} value={category} />
        <TextInput label="Year" onChange={setYear} value={year} />
        <TextInput
          label="Display number (optional)"
          onChange={setNumber}
          required={Boolean(item)}
          value={number}
        />
      </div>
      <TextInput
        label="Image URL or public asset path"
        onChange={setImage}
        placeholder="/assets/project-image.svg"
        value={image}
      />
      <Field label="Or upload an image">
        <input
          accept="image/png,image/jpeg,image/webp,image/gif"
          className={`${inputClassName} file:mr-3 file:rounded-md file:border-0 file:bg-[#edf7fa] file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-[#007f9b]`}
          disabled={uploadingImage}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void uploadImage(file)
            event.target.value = ""
          }}
          type="file"
        />
      </Field>
      {uploadingImage && (
        <p
          className="font-heebo-regular text-[13px] text-[#64748b] dark:text-[#94a3b8]"
          role="status"
        >
          Uploading image…
        </p>
      )}
      {imageUploadError && (
        <p
          className="font-heebo-medium text-[13px] text-[#bd3d3d] dark:text-[#ffaaaa]"
          role="alert"
        >
          {imageUploadError}
        </p>
      )}
      {image && (
        <img
          alt="Project image preview"
          className="max-h-48 w-fit max-w-full rounded-lg border border-[#d8dee8] object-contain dark:border-[#475569]"
          src={image}
        />
      )}
      <label className="flex items-start gap-3 rounded-lg border border-[#d8dee8] bg-[#f8fafc] p-3 dark:border-[#475569] dark:bg-[#16213b]">
        <input
          checked={featured}
          className="mt-1 h-4 w-4 accent-[#00a8cc]"
          onChange={(event) => setFeatured(event.target.checked)}
          type="checkbox"
        />
        <span>
          <span className="font-heebo-medium block text-[14px] text-[#21243d] dark:text-[#f8fafc]">
            Feature on home page
          </span>
          <span className="font-heebo-regular mt-1 block text-[12px] text-[#64748b] dark:text-[#94a3b8]">
            Show this project in the home page Featured Works section.
          </span>
        </span>
      </label>
      <TextArea label="Summary" onChange={setSummary} value={summary} />
      <TextInput
        label="Technologies (comma separated)"
        onChange={setTechnologies}
        placeholder="React, TypeScript, Node.js"
        value={technologies}
      />
      <TextArea
        label="Highlights (one per line)"
        onChange={setHighlights}
        rows={4}
        value={highlights}
      />
      <EditorActions
        onCancel={onCancel}
        saving={saving || uploadingImage}
        savingLabel={uploadingImage ? "Uploading image…" : "Saving…"}
      />
    </form>
  )
}

export function BlogEntryForm({
  item,
  saving,
  onSave,
  onCancel,
}: {
  item: BlogPost | null
  saving: boolean
  onSave: (input: BlogInput) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(item?.title ?? "")
  const [date, setDate] = useState(item?.date ?? "")
  const [dateTime, setDateTime] = useState(item?.dateTime ?? "")
  const [category, setCategory] = useState(item?.category ?? "")
  const [readTime, setReadTime] = useState(item?.readTime ?? "")
  const [summary, setSummary] = useState(item?.summary ?? "")
  const [content, setContent] = useState(item?.content ?? "")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      title: title.trim(),
      date: date.trim(),
      dateTime,
      category: category.trim(),
      readTime: readTime.trim(),
      summary: summary.trim(),
      content: content.trim(),
    })
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <TextInput label="Post title" onChange={setTitle} value={title} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Display date"
          onChange={setDate}
          placeholder="27 Oct 2026"
          value={date}
        />
        <TextInput
          label="Date"
          onChange={setDateTime}
          type="date"
          value={dateTime}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Category" onChange={setCategory} value={category} />
        <TextInput
          label="Read time"
          onChange={setReadTime}
          placeholder="5 min read"
          value={readTime}
        />
      </div>
      <TextArea label="Summary" onChange={setSummary} value={summary} />
      <TextArea
        label="Content"
        onChange={setContent}
        rows={8}
        value={content}
      />
      <EditorActions onCancel={onCancel} saving={saving} />
    </form>
  )
}

export function SkillEntryForm({
  item,
  saving,
  onSave,
  onCancel,
}: {
  item: Skill | null
  saving: boolean
  onSave: (input: SkillInput) => void
  onCancel: () => void
}) {
  const [group, setGroup] = useState(item?.group ?? "")
  const [name, setName] = useState(item?.name ?? "")
  const [logo, setLogo] = useState(item?.logo ?? "")
  const [color, setColor] = useState(item?.color ?? "")
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      group: group.trim(),
      name: name.trim(),
      ...(logo.trim() ? { logo: logo.trim() } : {}),
      ...(color.trim() ? { color: color.trim().replace(/^#/, "") } : {}),
      ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
    })
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Group"
          onChange={setGroup}
          placeholder="Front-end"
          value={group}
        />
        <TextInput label="Skill name" onChange={setName} value={name} />
        <TextInput
          label="Simple Icons slug (optional)"
          onChange={setLogo}
          placeholder="react"
          required={false}
          value={logo}
        />
        <TextInput
          label="Icon color hex (optional)"
          onChange={setColor}
          placeholder="61DAFB"
          required={false}
          value={color}
        />
      </div>
      <TextInput
        label="Custom icon image URL (optional)"
        onChange={setImageUrl}
        placeholder="/assets/custom-icon.svg"
        required={false}
        value={imageUrl}
      />
      <p className="font-heebo-regular text-[12px] leading-relaxed text-[#8695a4] dark:text-[#94a3b8]">
        Provide a custom image URL, or both a Simple Icons slug and color.
      </p>
      <EditorActions onCancel={onCancel} saving={saving} />
    </form>
  )
}

export function DailyThoughtEntryForm({
  item,
  saving,
  onSave,
  onCancel,
}: {
  item: DailyThought | null
  saving: boolean
  onSave: (input: DailyThoughtInput) => void
  onCancel: () => void
}) {
  const [text, setText] = useState(item?.text ?? "")
  const [author, setAuthor] = useState(item?.author ?? "")
  const [image, setImage] = useState(item?.image ?? "")
  const [imageAlt, setImageAlt] = useState(item?.imageAlt ?? "")
  const [imageSource, setImageSource] = useState(item?.imageSource ?? "")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUploadError, setImageUploadError] = useState("")

  async function uploadImage(file: File) {
    setImageUploadError("")
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("Image files must be 5 MB or smaller.")
      return
    }

    const formData = new FormData()
    formData.append("image", file)
    setUploadingImage(true)
    try {
      const uploaded = await adminRequest<{ image: string }>("/api/uploads", {
        method: "POST",
        body: formData,
      })
      setImage(uploaded.image)
    } catch (uploadError) {
      setImageUploadError(getErrorMessage(uploadError))
    } finally {
      setUploadingImage(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      text: text.trim(),
      author: author.trim(),
      image: image.trim(),
      imageAlt: imageAlt.trim(),
      imageSource: imageSource.trim(),
    })
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <TextArea label="Thought" onChange={setText} rows={3} value={text} />
      <TextInput label="Author" onChange={setAuthor} value={author} />
      <TextInput
        label="Portrait image URL (optional)"
        onChange={setImage}
        required={false}
        value={image}
      />
      <Field label="Or upload a portrait">
        <input
          accept="image/png,image/jpeg,image/webp,image/gif"
          className={`${inputClassName} file:mr-3 file:rounded-md file:border-0 file:bg-[#edf7fa] file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-[#007f9b]`}
          disabled={uploadingImage}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void uploadImage(file)
            event.target.value = ""
          }}
          type="file"
        />
      </Field>
      {uploadingImage && (
        <p
          className="font-heebo-regular text-[13px] text-[#64748b] dark:text-[#94a3b8]"
          role="status"
        >
          Uploading portrait…
        </p>
      )}
      {imageUploadError && (
        <p
          className="font-heebo-medium text-[13px] text-[#bd3d3d] dark:text-[#ffaaaa]"
          role="alert"
        >
          {imageUploadError}
        </p>
      )}
      <TextInput
        label="Portrait alt text (optional)"
        onChange={setImageAlt}
        required={false}
        value={imageAlt}
      />
      <TextInput
        label="Portrait source URL (optional)"
        onChange={setImageSource}
        required={false}
        value={imageSource}
      />
      {image && !imageUploadError && (
        <img
          alt={imageAlt || "Thought author portrait preview"}
          className="max-h-48 w-fit max-w-full border border-[#d8dee8] object-contain dark:border-[#475569]"
          src={image}
        />
      )}
      <EditorActions
        onCancel={onCancel}
        saving={saving || uploadingImage}
        savingLabel={uploadingImage ? "Uploading portrait…" : "Saving…"}
      />
    </form>
  )
}

export function AboutProfileEntryForm({
  item,
  saving,
  onSave,
  onCancel,
}: {
  item: AboutProfile
  saving: boolean
  onSave: (input: AboutProfileInput) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item.name)
  const [location, setLocation] = useState(item.location)
  const [education, setEducation] = useState(item.education)
  const [interest, setInterest] = useState(item.interest)
  const [image, setImage] = useState(item.image)
  const [imageAlt, setImageAlt] = useState(item.imageAlt ?? "")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUploadError, setImageUploadError] = useState("")

  async function uploadImage(file: File) {
    setImageUploadError("")
    if (file.size > 10 * 1024 * 1024) {
      setImageUploadError("Image files must be 10 MB or smaller.")
      return
    }

    const formData = new FormData()
    formData.append("image", file)
    setUploadingImage(true)
    try {
      const uploaded = await adminRequest<{ image: string }>(
        "/api/uploads/about",
        {
          method: "POST",
          body: formData,
        },
      )
      setImage(uploaded.image)
    } catch (uploadError) {
      setImageUploadError(getErrorMessage(uploadError))
    } finally {
      setUploadingImage(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      name: name.trim(),
      location: location.trim(),
      education: education.trim(),
      interest: interest.trim(),
      image: image.trim(),
      imageAlt: imageAlt.trim(),
    })
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Name" onChange={setName} value={name} />
        <TextInput label="Location" onChange={setLocation} value={location} />
      </div>
      <TextArea label="Education" onChange={setEducation} value={education} />
      <TextInput label="Interest" onChange={setInterest} value={interest} />
      <TextInput label="Portrait image URL" onChange={setImage} value={image} />
      <Field label="Or upload a portrait">
        <input
          accept="image/png,image/jpeg,image/webp,image/gif"
          className={`${inputClassName} file:mr-3 file:rounded-md file:border-0 file:bg-[#edf7fa] file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-[#007f9b]`}
          disabled={uploadingImage}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void uploadImage(file)
            event.target.value = ""
          }}
          type="file"
        />
      </Field>
      {uploadingImage && (
        <p
          className="font-heebo-regular text-[13px] text-[#64748b] dark:text-[#94a3b8]"
          role="status"
        >
          Uploading portrait…
        </p>
      )}
      {imageUploadError && (
        <p
          className="font-heebo-medium text-[13px] text-[#bd3d3d] dark:text-[#ffaaaa]"
          role="alert"
        >
          {imageUploadError}
        </p>
      )}
      <TextInput
        label="Portrait alt text (optional)"
        onChange={setImageAlt}
        required={false}
        value={imageAlt}
      />
      {image && !imageUploadError && (
        <img
          alt={imageAlt || "About profile portrait preview"}
          className="max-h-48 w-fit max-w-full border border-[#d8dee8] object-contain dark:border-[#475569]"
          src={image}
        />
      )}
      <EditorActions
        onCancel={onCancel}
        saving={saving || uploadingImage}
        savingLabel={uploadingImage ? "Uploading portrait…" : "Saving…"}
      />
    </form>
  )
}
