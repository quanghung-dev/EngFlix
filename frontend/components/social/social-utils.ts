export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "EF"
}

export function formatSocialDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Không rõ thời gian"
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatJoinedDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Chưa rõ"
  }

  return new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(date)
}
