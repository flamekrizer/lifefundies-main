import { motion } from "framer-motion";
import { Github, Twitter, Youtube, Linkedin, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProfileCardProps {
  name?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  /** Smaller image + tighter type scale, for use in dense grids. */
  compact?: boolean;
  className?: string;
}

export function ProfileCard(props: ProfileCardProps) {
  const {
    name = "Michael Chen",
    title = "Senior Software Engineer, Cloud Infrastructure",
    description = "Michael Chen is a seasoned software engineer at TechFlow Solutions with over 8 years of experience building scalable cloud infrastructure and microservices. He specializes in DevOps automation and leads the platform engineering team that serves millions of users daily.",
    imageUrl = "https://plus.unsplash.com/premium_photo-1689977807477-a579eda91fa2?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    githubUrl,
    twitterUrl,
    youtubeUrl,
    linkedinUrl,
    instagramUrl,
    compact = false,
    className,
  } = props;

  const socialIcons = [
    { icon: Github, url: githubUrl, label: "GitHub" },
    { icon: Twitter, url: twitterUrl, label: "Twitter" },
    { icon: Instagram, url: instagramUrl, label: "Instagram" },
    { icon: Youtube, url: youtubeUrl, label: "YouTube" },
    { icon: Linkedin, url: linkedinUrl, label: "LinkedIn" },
  ].filter((entry): entry is { icon: typeof Github; url: string; label: string } => Boolean(entry.url));

  return (
    <div className={cn("w-full max-w-5xl mx-auto px-4", className)}>
      {/* Desktop */}
      <div className='hidden md:flex relative items-center'>
        {/* Square Image */}
        <div
          className={cn(
            "aspect-square rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center",
            compact ? "w-[30%] max-w-[220px]" : "w-[42%] max-w-[470px]"
          )}
        >
          <img
            src={imageUrl}
            alt={name}
            className='w-full h-full object-cover'
            draggable={false}
            loading="eager"
          />
        </div>
        {/* Overlapping Card */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "bg-white dark:bg-card rounded-3xl shadow-2xl z-10 min-w-0 flex-1",
            compact ? "p-5 ml-[-40px]" : "p-8 ml-[-60px]"
          )}
        >
          <div className={compact ? "mb-3" : "mb-6"}>
            <h2 className={cn("font-bold text-gray-900 dark:text-white mb-1", compact ? "text-lg" : "text-2xl mb-2")}>
              {name}
            </h2>

            <p className={cn("font-medium text-gray-700 dark:text-gray-500", compact ? "text-xs" : "text-sm")}>
              {title}
            </p>
          </div>

          <p className={cn("text-black dark:text-white leading-relaxed", compact ? "text-xs mb-4 line-clamp-3" : "text-base mb-8")}>
            {description}
          </p>

          {socialIcons.length > 0 && (
            <div className={cn("flex", compact ? "space-x-2" : "space-x-4")}>
              {socialIcons.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={cn(
                    "bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center transition-colors hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-105",
                    compact ? "w-8 h-8" : "w-12 h-12"
                  )}
                  aria-label={label}
                >
                  <Icon className={compact ? "w-3.5 h-3.5 text-white dark:text-gray-900" : "w-5 h-5 text-white dark:text-gray-900"} />
                </a>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn("md:hidden mx-auto text-center bg-transparent", compact ? "max-w-[220px]" : "max-w-sm")}
      >
        {/* Square Mobile Image */}
        <div className={cn("w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-3xl overflow-hidden flex items-center justify-center", compact ? "mb-3" : "mb-6")}>
          <img
            src={imageUrl}
            alt={name}
            className='w-full h-full object-cover'
            draggable={false}
            loading="eager"
          />
        </div>

        <div className={compact ? "px-1" : "px-4"}>
          <h2 className={cn("font-bold text-gray-900 dark:text-white mb-1", compact ? "text-base" : "text-xl mb-2")}>
            {name}
          </h2>

          <p className={cn("font-medium text-gray-600 dark:text-gray-300", compact ? "text-xs mb-2" : "text-sm mb-4")}>
            {title}
          </p>

          {!compact && (
            <p className='text-black dark:text-white text-sm leading-relaxed mb-6'>
              {description}
            </p>
          )}

          {socialIcons.length > 0 && (
            <div className={cn("flex justify-center", compact ? "space-x-2" : "space-x-4")}>
              {socialIcons.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={cn(
                    "bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center transition-colors hover:bg-gray-800 dark:hover:bg-gray-200",
                    compact ? "w-8 h-8" : "w-12 h-12"
                  )}
                  aria-label={label}
                >
                  <Icon className={compact ? "w-3.5 h-3.5 text-white dark:text-gray-900" : "w-5 h-5 text-white dark:text-gray-900"} />
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
