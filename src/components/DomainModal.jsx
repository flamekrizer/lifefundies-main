"use client";
import { motion } from "framer-motion";

export default function DomainModal({ domain, close }) {

  const data = {
    "Health & Fitness": [
      "Physical Health",
      "Mental Health",
      "Nutrition",
      "Exercise"
    ],
    "Career & Work": [
      "Career Planning",
      "Skill Development",
      "Work-Life Balance",
      "Networking"
    ],
    "Relationships": [
      "Family",
      "Friends",
      "Romantic Relationships",
      "Community Involvement"
    ],
    "Financial Wellbeing": [
      "Budgeting",
      "Saving & Investing",
      "Debt Management",
      "Retirement Planning"
    ],
    "Personal Growth & Self-Improvement": [
      "Goal Setting",
      "Time Management",
      "Mindfulness",
      "Hobbies"
    ],
    "Spirituality & Inner Peace": [
      "Meditation",
      "Faith Practices",
      "Gratitude",
      "Life Purpose"
    ],
    "Lifestyle": [
      "Home Organization",
      "Sustainable Living",
      "Travel",
      "Work Environment"
    ],
    "Education & Learning": [
      "Formal Education",
      "Online Courses",
      "Reading",
      "Skill Acquisition"
    ],
    "Entertainment & Leisure": [
      "Movies & TV",
      "Music",
      "Gaming",
      "Outdoor Activities"
    ],
    "Technology & Digital Life": [
      "Digital Literacy",
      "Online Safety",
      "Tech Tools",
      "Social Media Management"
    ],
    "Family Responsibilities": [
      "Parenting",
      "Elder Care",
      "Household Management",
      "Family Health"
    ],
    "Love & Intimacy": [
      "Emotional Connection",
      "Physical Intimacy",
      "Communication",
      "Trust Building"
    ],
    "Creativity": [
      "Art & Craft",
      "Writing",
      "Music",
      "DIY Projects"
    ],
    "Society & Contribution": [
      "Volunteering",
      "Charity Work",
      "Community Service",
      "Advocacy"
    ],
    "Stress & Challenges": [
      "Coping Strategies",
      "Resilience Building",
      "Support Systems",
      "Professional Help"
    ],
    "Social Life": [
      "Social Skills",
      "Event Planning",
      "Networking",
      "Community Engagement"
    ],
    "Dreams & Aspirations": [
      "Vision Boarding",
      "Long-term Planning",
      "Motivation",
      "Overcoming Obstacles"
    ],
    "Self-Identity": [
      "Self Awareness",
      "Values",
      "Strengths",
      "Weaknesses"
    ]
  };

  const items = data[domain] || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} 
      className="fixed inset-0 
      bg-black/70 backdrop-blur-sm 
      z-[9999] flex 
      items-center justify-center 
      px-4"
    >
      {/* CARD */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full 
        max-w-4xl 
        rounded-3xl 
        bg-gradient-to-br 
        from-[#0b0f1a] to-[#05070f] 
        border border-white/10 
        p-10 shadow-2xl"
      >
        {/* Close */}
        <button
          onClick={close}
          className="absolute top-6 right-6 
          text-white text-2xl 
          hover:rotate-90 transition"
        >
          ✕
        </button>

        {/* Heading */}
        <h2 className="text-3xl 
        md:text-4xl font-bold mb-10">
          {domain}
        </h2>

        {/* SUB CARDS */}
        <div className="grid 
        grid-cols-1 
        md:grid-cols-2 
        gap-8">

          {items.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="bg-white/5 
              border border-white/10 
              rounded-2xl p-6 
              backdrop-blur-xl 
              hover:border-blue-500 
              transition"
            >
              <h3 className="text-xl 
              font-semibold mb-5">
                {item}
              </h3>

              <div className="flex gap-4">

                <button
                  className="flex-1 
                  py-2 rounded-lg 
                  border border-white/20
                  hover:bg-white 
                  hover:text-black 
                  transition"
                >
                  Book Now
                </button>

                <button
                  className="flex-1 
                  py-2 rounded-lg 
                  border border-blue-500
                  text-blue-500
                  hover:bg-blue-500 
                  hover:text-white 
                  transition"
                >
                  Get Guide
                </button>

              </div>
            </motion.div>
          ))}

        </div>
      </motion.div>
    </motion.div>
  );
}