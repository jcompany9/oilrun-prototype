import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKRW(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const w = WEEKDAYS[date.getDay()]
  return `${y}년 ${m}월 ${d}일 (${w})`
}

export function formatTime(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours < 12 ? "오전" : "오후"
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  const displayMinute = minutes.toString().padStart(2, "0")
  return `${period} ${displayHour}:${displayMinute}`
}

const PLATE_REGEX = /^[0-9]{2,3}[가-힣][0-9]{4}$/

export function normalizePlate(input: string): string {
  return input.replace(/\s+/g, "").trim()
}

export function isValidPlate(plate: string): boolean {
  return PLATE_REGEX.test(normalizePlate(plate))
}
