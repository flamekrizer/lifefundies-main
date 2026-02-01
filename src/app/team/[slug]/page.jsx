import Image from "next/image";
import { teamMembers, advisors } from "@/data/team";

const allPeople = [...teamMembers, ...advisors];

// REQUIRED for output: "export"
export function generateStaticParams() {
  return allPeople.map(person => ({
    slug: person.slug,
  }));
}

export default async function TeamProfile({ params }) {
  const { slug } = await params;

  const person = allPeople.find(p => p.slug === slug);

  if (!person) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-semibold">Profile not found</h1>
      </main>
    );
  }

  return (
    <main className="bg-black text-white min-h-screen px-6 py-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">

        {/* IMAGE CARD */}
        <div className="relative">
          <Image
            src={person.image}
            alt={person.name}
            width={520}
            height={620}
            className="rounded-2xl object-cover shadow-2xl"
          />

          {/* BADGE */}
          {person.type === "advisor" && (
            <span className="absolute top-4 left-4 bg-blue-500/90 
              text-sm px-4 py-1 rounded-full font-medium">
              Global Advisor
            </span>
          )}
        </div>

        {/* CONTENT */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {person.name}
          </h1>

          <p className="text-blue-400 text-lg mb-6">
            {person.role}
          </p>

          <div className="text-gray-300 leading-relaxed space-y-5">
            {person.bio.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* HIGHLIGHTS */}
          {person.highlights && (
            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4">
                Key Expertise
              </h3>
              <ul className="space-y-3 text-gray-300">
                {person.highlights.map((item, i) => (
                  <li key={i}>✔ {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* CONTACT / LINKS */}
          {person.contact && (
            <div className="mt-10 border-t border-white/10 pt-6 text-sm text-gray-400">
              <p className="mb-2 font-medium text-white">Contact</p>
              {person.contact.email && <p>📧 {person.contact.email}</p>}
              {person.contact.phone && <p>📞 {person.contact.phone}</p>}
              {person.contact.address && <p>📍 {person.contact.address}</p>}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}