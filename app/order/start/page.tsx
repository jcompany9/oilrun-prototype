"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Car, Droplet } from "lucide-react"

export default function StartPage() {
  return (
    <div className="flex flex-1 flex-col px-6 pt-12 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-1 flex-col items-center justify-center text-center"
      >
        <div className="relative mb-12">
          <div
            className="flex h-32 w-32 items-center justify-center rounded-full"
            style={{ backgroundColor: "#EFF4FF" }}
          >
            <Car
              className="h-16 w-16"
              style={{ color: "#1E40AF" }}
              strokeWidth={1.5}
            />
          </div>
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 220 }}
            className="absolute -right-2 -bottom-1 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md"
          >
            <Droplet
              className="h-7 w-7"
              style={{ color: "#F97316" }}
              fill="#F97316"
              strokeWidth={2}
            />
          </motion.div>
        </div>

        <h1 className="mb-4 text-3xl leading-snug font-bold text-gray-900">
          오일교환,
          <br />
          어디서든 5분이면 끝나요
        </h1>
        <p className="text-base text-gray-600">
          차량번호만 입력하면 추천부터 결제까지
        </p>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-gray-100 bg-white p-4">
        <Link
          href="/order/vehicle"
          className="flex h-14 w-full items-center justify-center rounded-xl text-lg font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#F97316" }}
        >
          시작하기
        </Link>
      </div>
    </div>
  )
}
