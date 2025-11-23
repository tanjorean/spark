'use client'


import { useState, useEffect } from 'react'
import Link from 'next/link'
import { onAuthStateChanged } from "firebase/auth"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import DeadlineNotifications from "@/app/components/DeadlineNotifications"
import Navbar from "@/app/components/Navbar"

export default function BookmarksPage() {
  const [user, setUser] = useState(null)
  const [bookmarkedPrograms, setBookmarkedPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  
  const programs = [

  {
    id: 1,
    title: "MIT Launch Entrepreneurship",
    category: "Summer Program",
    state: "Massachusetts",
    description: "4-week summer program teaching students to start real companies",
    gradeLevel: [10, 11, 12],
    fields: ["Business & Entrepreneurship", "Leadership"],
    deadline: "2025-03-01",
    cost: "Free",
    duration: "4 weeks",
    website: "https://mitlaunch.org"
  },
  {
    id: 2,
    title: "Girls Who Code Summer Immersion",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Free 7-week coding program for high school girls",
    gradeLevel: [9, 10, 11],
    fields: ["Computer Science & Technology"],
    deadline: "2025-02-15",
    cost: "Free",
    duration: "7 weeks",
    website: "https://girlswhocode.com"
  },
  {
    id: 3,
    title: "Stanford AI4ALL",
    category: "Summer Program",
    state: "California",
    description: "3-week residential AI education program",
    gradeLevel: [11, 12],
    fields: ["Computer Science & Technology", "STEM"],
    deadline: "2025-03-15",
    cost: "Free with stipend",
    duration: "3 weeks",
    website: "https://ai-4-all.org"
  },
  {
    id: 4,
    title: "Young Arts Competition",
    category: "Competition",
    state: "All States",
    description: "National arts competition with $10,000 awards",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Visual Arts", "Theater", "Arts & Humanities"],
    deadline: "2025-10-01",
    cost: "$35 application fee",
    duration: "Year-round",
    website: "https://youngarts.org"
  },
  {
    id: 5,
    title: "Tennessee Governor's School",
    category: "Summer Program",
    state: "Tennessee",
    description: "Residential summer program for gifted students",
    gradeLevel: [11, 12],
    fields: ["STEM", "Visual Arts", "Liberal Arts"],
    deadline: "2025-01-15",
    cost: "Free",
    duration: "4 weeks",
    website: "https://tngifted.org"
  },
  {
    id: 21,
    title: "Frist Art Museum Volunteer Program",
    category: "Volunteer Opportunity",
    state: "Tennessee",
    description: "Volunteers (15 years or older) support the Frist Art Museum in a variety of roles by providing assistance to both our staff and visitors in diverse ways. They are involved in helping around the museum and can teach others art.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Visual Arts", "Museum Studies", "Community Service"],
    deadline: "2025-12-30",
    cost: "Free",
    duration: "Ongoing",
    website: "https://fristartmuseum.org/visit/volunteer"
  },
  {
    id: 22,
    title: "Student Member on Tennessee State Board of Education",
    category: "Leadership Opportunity",
    state: "Tennessee",
    description: "A rising junior or senior (current 10th or 11th grade) in high school can be appointed by the Governor to serve as the student advisor on the Tennessee State Board of Education. This student serves a one-year term and they represent students across Tennessee.",
    gradeLevel: [10, 11],
    fields: ["Government & Politics", "Public Service", "Civic Engagement"],
    deadline: "2025-12-31",
    cost: "Free",
    duration: "1 year",
    website: "https://www.tn.gov/education/about-tdoe/state-board-of-education.html"
  },
  {
    id: 23,
    title: "Youth Leadership Programs Tennessee",
    category: "Leadership Opportunity",
    state: "Tennessee",
    description: "This program is a leadership development program for high school students to cultivate their leadership skills and help their community. They are currently located in Oak Ridge, Knoxville, Davidson County, Williamson County, Hawkins County, Greene County, Jefferson County, Carter County, Anderson County, and Hamilton County.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Leadership", "Civic Engagement", "Community Service"],
    deadline: "2025-12-31",
    cost: "Varies by location",
    duration: "Varies",
    website: "https://www.tn.gov"
  },
  {
    id: 24,
    title: "Youth Advisory Board for County Health Department",
    category: "Leadership Opportunity",
    state: "Tennessee",
    description: "The Youth Advisory Board (YAB) is a group of high school students who advise the health department on public health issues that affect people in the community. The YAB creates monthly public health service-learning projects. Currently located in Davidson County and Knox County.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Public Health", "Public Service", "Civic Engagement"],
    deadline: "2025-12-31",
    cost: "Free",
    duration: "1 year",
    website: "https://www.nashville.gov/departments/health"
  },
  {
    id: 25,
    title: "Superintendent Student Advisory Council",
    category: "Leadership Opportunity",
    state: "Tennessee",
    description: "This council represents a diverse team of student voices from each high school in the district. The purpose is for high school students to share feedback, experiences, and perspectives on various issues affecting schools and communities. Available in almost every county in TN including Shelby, Williamson, Hamilton, Knox, Humboldt City, and Wilson County.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Public Service", "Civic Engagement", "Leadership"],
    deadline: "2025-12-31",
    cost: "Free",
    duration: "1 year",
    website: "https://www.tn.gov"
  },
  {
    id: 26,
    title: "YMCA Youth Advocate Program",
    category: "Leadership Opportunity",
    state: "All States",
    description: "This program provides practical, real-world experience advocating for policy solutions that help the Y address critical social issues in three areas: youth development, healthy living, and social responsibility. Open to all high school students (grades 9-12) to advocate policy solutions to Members of Congress.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Government & Politics", "Social Justice", "Civic Engagement"],
    deadline: "2025-09-30",
    cost: "Free",
    duration: "Year-round",
    website: "https://ymca.quorum.us/youth-advocates/"
  },
  {
    id: 27,
    title: "Bank of America Student Leaders Program",
    category: "Summer Program",
    state: "All States",
    description: "Eight-week paid internship for high school juniors and seniors at a local nonprofit organization where they learn first-hand about the needs of their community and the critical role nonprofits play. Includes Student Leaders Summit in Washington, D.C.",
    gradeLevel: [11, 12],
    fields: ["Leadership", "Nonprofit", "Community Service"],
    deadline: "2025-01-31",
    cost: "Free (Paid internship)",
    duration: "8 weeks",
    website: "https://about.bankofamerica.com/en/making-an-impact/student-leaders"
  },
  {
    id: 28,
    title: "High School Summer Intern Program (Law)",
    category: "Summer Program",
    state: "Tennessee",
    description: "Beneficial to students interested in a legal career. Provides students with direct and immediate access to the legal field, a paid seven week internship with a legal employer, networking opportunities with career-minded peers and lawyers. Available in Nashville, Memphis and Chattanooga.",
    gradeLevel: [10, 11, 12],
    fields: ["Law & Legal Studies", "Career Development"],
    deadline: "2025-03-31",
    cost: "Free (Paid internship)",
    duration: "7 weeks",
    website: "https://www.nashvillebar.org"
  },
  {
    id: 29,
    title: "American Legion Auxiliary Girls State Tennessee",
    category: "Summer Program",
    state: "Tennessee",
    description: "Open to female high school students who have completed their junior year. Competitively selected and sponsored by American Legion Auxiliary units. Learn about the political process by electing officials for all levels of state government and actively running a mock government.",
    gradeLevel: [11],
    fields: ["Government & Politics", "Civic Engagement", "Leadership"],
    deadline: "2025-01-31",
    cost: "Free",
    duration: "1 week",
    website: "https://www.tnalagirlsstate.org"
  },
  {
    id: 30,
    title: "Tennessee American Legion Boys State",
    category: "Summer Program",
    state: "Tennessee",
    description: "Open to male high school students who are rising seniors. Learn about government, leadership, and how to affect the local community. Activities include legislative sessions, court proceedings, law enforcement presentations, assemblies, bands, chorus and recreational programs.",
    gradeLevel: [11],
    fields: ["Government & Politics", "Civic Engagement", "Leadership"],
    deadline: "2025-03-31",
    cost: "Free",
    duration: "1 week",
    website: "https://www.tnboysstate.org"
  },
  {
    id: 31,
    title: "Biomedical Research Summer Program at Vanderbilt",
    category: "Summer Program",
    state: "Tennessee",
    description: "Engages and introduces high school students (rising 11th and 12th) to the foundation of basic science medical information from diverse early career professionals. Includes stimulating discussions on STEM topics, 1:1 mentoring, training in lab skills, and graduate school experiences.",
    gradeLevel: [10, 11],
    fields: ["Biology & Life Sciences", "Healthcare & Medicine", "Research"],
    deadline: "2025-04-30",
    cost: "Free",
    duration: "Summer session",
    website: "https://redcap.vanderbilt.edu/surveys/?s=EAJLECH3KD4DTXX7"
  },
  {
    id: 32,
    title: "Belmont RISE Program",
    category: "Summer Program",
    state: "Tennessee",
    description: "Provides high school students (grades 9-12) exposure to data science, statistics, and scientific research through coursework and guided group research projects. Led by faculty in the analysis and predictive utilization of healthcare data, focusing on cardiovascular health.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Data Science", "Healthcare & Medicine", "Research"],
    deadline: "2025-04-15",
    cost: "Free",
    duration: "Summer session",
    website: "https://www.belmont.edu/science-math/summer-programs/camps.html"
  },
  {
    id: 33,
    title: "Telluride Association Summer Seminar (TASS)",
    category: "Summer Program",
    state: "All States",
    description: "Free six week summer program open to rising high school juniors and seniors. TASS prepares and inspires promising young students to lead and serve through transformative educational experiences rooted in critical thinking and democratic community. Covers all costs including tuition, books, room and board, field trips, and facilities fees.",
    gradeLevel: [10, 11],
    fields: ["Leadership", "Critical Thinking", "Liberal Arts"],
    deadline: "2025-01-15",
    cost: "Free (All expenses covered)",
    duration: "6 weeks",
    website: "https://www.tellurideassociation.org/our-programs/high-school-students/"
  },
  {
    id: 34,
    title: "HITES Program - University of Tennessee",
    category: "Summer Program",
    state: "Tennessee",
    description: "Selects rising 12th grade students eager to tackle real-world engineering challenges. Provides opportunity to explore engineering and campus life at UTK. Students engage with faculty, learn engineering fundamentals, and compete in daily engineering challenges. Includes team engineering design project.",
    gradeLevel: [11],
    fields: ["Engineering", "STEM"],
    deadline: "2025-01-01",
    cost: "Free",
    duration: "Summer session",
    website: "https://tickle.utk.edu/future-students/pre-college/hites12/"
  },
  {
    id: 35,
    title: "NASA Internship Program",
    category: "Summer Program",
    state: "All States",
    description: "NASA offers a multitude of internship opportunities for high school sophomores, juniors, and seniors over 16 years of age. Internships are designed to increase the capabilities and diversity of the nation's STEM workforce. Participants perform research under the guidance of a mentor at a NASA facility.",
    gradeLevel: [10, 11, 12],
    fields: ["Aerospace", "Engineering", "Research", "STEM"],
    deadline: "2025-03-01",
    cost: "Free (Paid internship)",
    duration: "10 weeks",
    website: "https://intern.nasa.gov/"
  },
  {
    id: 36,
    title: "Research Science Institute (RSI)",
    category: "Summer Program",
    state: "All States",
    description: "Cost-free, 5 week internship for high school juniors combining on-campus course work in scientific theory with off-campus work in science and technology research. Participants experience the entire research cycle from start to finish. Read current literature, draft and execute detailed research plan, and deliver conference-style oral and written reports.",
    gradeLevel: [11],
    fields: ["Research", "Science", "STEM"],
    deadline: "2025-01-15",
    cost: "Free (All expenses covered)",
    duration: "5 weeks",
    website: "https://www.cee.org/programs/apply-rsi"
  },
  {
    id: 37,
    title: "Princeton Summer Journalism Program",
    category: "Summer Program",
    state: "All States",
    description: "Free program for aspiring journalists open to high school juniors. Hybrid program begins with online workshops and concludes with a 10-day residential institute at Princeton. Includes college application preparation and culminates with publication of The Princeton Summer Journal.",
    gradeLevel: [11],
    fields: ["Journalism", "Writing", "Communications", "College Preparation"],
    deadline: "2025-02-15",
    cost: "Free",
    duration: "10 days residential + online",
    website: "https://summerjournalism.princeton.edu/"
  },
  {
    id: 38,
    title: "Broad Summer Scholars Program",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Six-week program for rising Massachusetts high school seniors with an interest in science. Participants paired with scientists to conduct original cutting-edge research in cancer biology, psychiatric disease, chemical biology, computational biology, and infectious disease. Includes $3,600 stipend.",
    gradeLevel: [11],
    fields: ["Biology & Life Sciences", "Healthcare & Medicine", "Research"],
    deadline: "2025-01-22",
    cost: "Free with $3,600 stipend",
    duration: "6 weeks",
    website: "https://www.broadinstitute.org/summer-scholars"
  },
  {
    id: 39,
    title: "Massachusetts Life Sciences Center High School Apprenticeship",
    category: "Summer Program",
    state: "Massachusetts",
    description: "More than 150 internship opportunities for underrepresented, low-income students at small life science and research institutions across Massachusetts. Students must be at least 16 years old. Paid $17/hour for 6 weeks with pre-internship lab training available.",
    gradeLevel: [10, 11, 12],
    fields: ["Biology & Life Sciences", "Research", "Career Development"],
    deadline: "2025-12-31",
    cost: "Free (Paid $17/hour)",
    duration: "6 weeks",
    website: "https://www.masslifesciences.com/programs/high-school-apprenticeship/"
  },
  {
    id: 40,
    title: "BU RISE Internship",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Six-week residential program for high school juniors. Interns work 40 hours a week on research projects under mentorship of faculty, postdoctoral fellows, and graduate students. Includes workshops for academic and professional skills development. Research available in astronomy, biology, engineering, neuroscience, psychology, public health, and more.",
    gradeLevel: [11],
    fields: ["Research", "Science", "Biology", "Engineering", "Professional Skills"],
    deadline: "2025-02-28",
    cost: "Free (Residential)",
    duration: "6 weeks",
    website: "https://www.bu.edu/summer/high-school-programs/rise/"
  },
  {
    id: 41,
    title: "GROW - Greater Boston Research Opportunities for Young Women",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Six week internship for rising high school seniors interested in science research. Conduct research at Boston University labs in collaborative groups. Includes goal-setting with Program Managers, lectures from guest speakers, and summer symposium presentation. $1,500 stipend upon completion.",
    gradeLevel: [11],
    fields: ["Research", "Biology", "Science", "STEM"],
    deadline: "2025-04-28",
    cost: "Free with $1,500 stipend",
    duration: "6 weeks",
    website: "https://www.bu.edu/lernet/grow/"
  },
  {
    id: 42,
    title: "Mass General Hospital Youth Scholars Program",
    category: "Academic Program",
    state: "Massachusetts",
    description: "Program for high schoolers in grades 9-12 from Boston, Chelsea, and Revere to increase awareness of careers in science and healthcare. Provides academic support through high school and college. 100% high school graduation rate, 87% enter post-secondary education.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Healthcare & Medicine", "Career Development", "College Preparation"],
    deadline: "2025-12-31",
    cost: "Free",
    duration: "Year-round",
    website: "https://www.massgeneral.org/children/youth-programs"
  },
  {
    id: 43,
    title: "Museum of Science Academic Year/Summer Youth Internship",
    category: "Academic Program",
    state: "Massachusetts",
    description: "Paid and unpaid internship opportunities for high schoolers ages 14-19. Work during academic year or summer on various projects. Includes weekly workshops on financial literacy, resume writing, plus field trips to cultural sites and local colleges.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Science", "Museum Studies", "Professional Skills"],
    deadline: "2025-12-31",
    cost: "Free (Some paid positions)",
    duration: "Varies",
    website: "https://www.mos.org/teen-programs"
  },
  {
    id: 44,
    title: "MIT Research Science Institute (RSI)",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Prestigious cost-free program accepting 100 of the world's most accomplished high school juniors. Experience complete research cycle from start to finish. First week: intensive STEM classes. Following five weeks: individual research project under experienced scientists. Requires minimum 740 SAT Math, 700 Reading/Writing or 33 ACT Math, 34 Verbal.",
    gradeLevel: [11],
    fields: ["Research", "Science", "STEM", "College Preparation"],
    deadline: "2025-01-15",
    cost: "Free",
    duration: "6 weeks",
    website: "https://www.cee.org/programs/research-science-institute"
  },
  {
    id: 45,
    title: "Paul Revere House One-Week Internship",
    category: "Summer Program",
    state: "Massachusetts",
    description: "One-week internship for students entering 10th, 11th, and 12th grade. Work directly with museum staff to understand how history museums function and create content. Includes both independent and group work. No prior expertise required.",
    gradeLevel: [10, 11, 12],
    fields: ["History", "Museum Studies", "Arts & Humanities"],
    deadline: "2025-04-30",
    cost: "Free",
    duration: "1 week (July 21-25)",
    website: "https://www.paulreverehouse.org/internships"
  },
  {
    id: 46,
    title: "Northeastern Young Scholars Program (YSP)",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Free program for Massachusetts resident rising juniors interested in science or engineering careers. Gain firsthand research experience in Northeastern University laboratories. Includes education and career counseling, career path seminars, and field trips. Priority to students with low access to similar programs.",
    gradeLevel: [10],
    fields: ["Science", "Engineering", "Research", "Career Development"],
    deadline: "2025-03-15",
    cost: "Free",
    duration: "6 weeks",
    website: "https://www.northeastern.edu/ysp/"
  },
  {
    id: 47,
    title: "Tufts Biomedical Engineering Research Scholars (TUBERS)",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Free program for talented high schoolers over 16. Learn general research techniques at Tufts biomedical engineering labs, then focus on specific project. Participants encouraged to use projects for science competitions. Requires reference letter from science teacher.",
    gradeLevel: [11, 12],
    fields: ["Engineering", "Biology & Life Sciences", "Research"],
    deadline: "2025-03-01",
    cost: "Free",
    duration: "6 weeks",
    website: "https://engineering.tufts.edu/bme/tubers"
  },
  {
    id: 48,
    title: "Museum of Fine Arts Boston Teen Programs",
    category: "Academic Program",
    state: "Massachusetts",
    description: "12-month paid program for rising sophomores, juniors, and seniors with interest in arts. Open to Boston residents and Boston public school students. Firsthand look at museum operations, studio art classes, and workshops with artists, leaders, and innovators.",
    gradeLevel: [9, 10, 11],
    fields: ["Visual Arts", "Museum Studies", "Arts & Humanities"],
    deadline: "2025-05-31",
    cost: "Free (Paid position)",
    duration: "12 months",
    website: "https://www.mfa.org/programs/teens"
  },
  {
    id: 49,
    title: "Artists for Humanity Teen Jobs",
    category: "Academic Program",
    state: "Massachusetts",
    description: "Paid employment in art and design for high school freshmen, sophomores, and juniors. Must be 14+, Boston resident or attend Boston public school. Work with professional artists in 3D Design, Animation, Creative Tech, Graphic Design, Painting, Photography, and Video studios. Requires 36-hour unpaid apprenticeship first.",
    gradeLevel: [9, 10, 11],
    fields: ["Visual Arts", "Design", "Technology", "Career Development"],
    deadline: "2025-12-31",
    cost: "Free (Paid position after apprenticeship)",
    duration: "Ongoing",
    website: "https://afhboston.org/employment"
  },
  {
    id: 50,
    title: "TIP Internship Program - Banking & Finance",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Program for Boston public school students with interest in finance and banking. Provides income-eligible students who've completed sophomore year with work experience in a bank, job coaching, and skills workshops on workplace success and personal financial stability.",
    gradeLevel: [10, 11, 12],
    fields: ["Finance", "Business & Entrepreneurship", "Professional Skills"],
    deadline: "2025-12-31",
    cost: "Free (Paid internship)",
    duration: "Summer",
    website: "https://www.bostonpic.org/tip-program"
  },
  {
    id: 51,
    title: "Army Educational Outreach Program (AEOP) High School Apprenticeship",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Internship opportunities at sites in Cambridge and Boston. Immerse in research working with high-tech equipment and cutting-edge techniques under mentorship of professional scientists and engineers. Includes college readiness and professional skills workshops. Educational stipend provided.",
    gradeLevel: [10, 11, 12],
    fields: ["Research", "Engineering", "Science", "College Preparation"],
    deadline: "2025-12-31",
    cost: "Free (Paid stipend)",
    duration: "Varies",
    website: "https://www.usaeop.com/program/high-school-apprenticeship/"
  },
  {
    id: 52,
    title: "Dana-Farber Student Training Academic-Year Internship",
    category: "Academic Program",
    state: "Massachusetts",
    description: "Eight-month program (October-June) for Boston residents affiliated with Fenway High School, John D. O'Bryant School, Madison Park Technical, Sociedad Latina, or Youth Enrichment Services. Intern in hospital department aligned with interests. Build professional skills via mentorship, student retreats, and college tours. Minimum 2.0 GPA required.",
    gradeLevel: [9, 10, 11],
    fields: ["Healthcare & Medicine", "Professional Skills", "Career Development"],
    deadline: "2025-09-30",
    cost: "Free",
    duration: "8 months (8-15 hrs/week)",
    website: "https://www.dana-farber.org/for-students-and-trainees/"
  },
  {
    id: 53,
    title: "Ragon Institute Summer Experience (RISE)",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Paid 25-hour/week internship for rising seniors interested in STEM. Pairs students with mentors for lab projects. Includes coursework in immunology, lectures, and workshops. Priority to gateway communities like Cambridge, Boston, Everett, Revere, Lynn, Brockton, and Chelsea. Requires personal statement and letters of recommendation.",
    gradeLevel: [11],
    fields: ["Biology & Life Sciences", "Healthcare & Medicine", "Research"],
    deadline: "2025-02-28",
    cost: "Free (Paid internship)",
    duration: "7 weeks",
    website: "https://ragoninstitute.org/education/rise/"
  },
  {
    id: 54,
    title: "LEAH Knox Scholars Program",
    category: "Academic Program",
    state: "Massachusetts",
    description: "Two-year research experience for rising juniors and seniors within commuting distance of MIT. Conduct research and learn quantitative methods, data analysis, coding, and molecular biology. First summer: intensive lab at MIT. School year: paid STEM teaching internship, mentorship, monthly events. Second summer: college app support and external lab placements. Earn up to $2,250 summer + $2,500 academic year.",
    gradeLevel: [10, 11],
    fields: ["Biology & Life Sciences", "Data Science", "Research", "College Preparation"],
    deadline: "2025-03-31",
    cost: "Free (Paid up to $4,750 total)",
    duration: "2 years",
    website: "https://leahknox.mit.edu/"
  },
  {
    id: 55,
    title: "Boston Public Library Teen Volunteer Program",
    category: "Volunteer Opportunity",
    state: "Massachusetts",
    description: "High schoolers in grades 9-12 volunteer at Boston Public Library locations throughout the city. Build career and customer service skills, participate in career-readiness workshops on resume writing and interview skills. Assist with creating book lists, shelving, building displays, and locating books.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Community Service", "Professional Skills", "Career Development"],
    deadline: "2025-12-31",
    cost: "Free",
    duration: "Varies",
    website: "https://www.bpl.org/teen-programs/"
  },
  {
    id: 56,
    title: "New England Aquarium Teen Internships",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Two internship tracks for students interested in marine sciences and ocean protection. Visitor Services Assistants focus on customer service. Interpretation and Engagement Aquarium Guides teach visitors about animals and ocean conservation. Paid positions for Boston and Cambridge residents.",
    gradeLevel: [10, 11, 12],
    fields: ["Marine Science", "Biology & Life Sciences", "Environmental Science"],
    deadline: "2025-03-31",
    cost: "Free (Paid internship)",
    duration: "7 weeks",
    website: "https://www.neaq.org/get-involved/volunteer/teen-internships/"
  },
  {
    id: 57,
    title: "Boston Society for Architecture High School Internship",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Six-week immersive program at local architecture firms (July 7-August 15, 2025). Experience architecture field through hands-on work at firms of varying sizes and focuses. Includes neighborhood tours and connection with other interns. Explore architecture in the city.",
    gradeLevel: [10, 11, 12],
    fields: ["Architecture", "Design", "Career Development"],
    deadline: "2025-05-31",
    cost: "Free",
    duration: "6 weeks (July 7 - Aug 15)",
    website: "https://www.architects.org/career-development/internships"
  },
  {
    id: 58,
    title: "Massachusetts Supreme Judicial Court Judicial Youth Corps",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Summer job program where students learn about Massachusetts court system and rule of law. Work 4 days/week for 6.5 weeks in Suffolk County courts. Educational sessions about law and legal field. Mentored by judges, lawyers, clerks, probation officers. Optional mock trial in federal court. $15/hour, 25 hours/week. Must be Boston resident or Boston Public School student in good academic standing with social security number.",
    gradeLevel: [10, 11, 12],
    fields: ["Law & Legal Studies", "Government & Politics", "Career Development"],
    deadline: "2025-05-31",
    cost: "Free (Paid $15/hour)",
    duration: "6.5 weeks",
    website: "https://www.mass.gov/service-details/judicial-youth-corps"
  },
  {
    id: 59,
    title: "National Security Language Institute for Youth (NSLI-Y)",
    category: "Academic Program",
    state: "All States",
    description: "Opportunities to study less commonly taught languages in immersion programs abroad. Languages include Arabic, Mandarin Chinese, Korean, Persian, Russian, and Turkish. Live with host families. For U.S. citizen high school students, age 15-18, with 2.5 GPA or above.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Language Studies", "Cultural Exchange"],
    deadline: "2025-11-01",
    cost: "Free (Fully funded: travel, lodging, studies)",
    duration: "Summer or Academic Year",
    website: "https://www.nsliforyouth.org/"
  },
  {
    id: 60,
    title: "Congress-Bundestag Youth Exchange (CBYX) - Germany",
    category: "Academic Program",
    state: "All States",
    description: "Cultural exchange to study abroad in Germany. Meet with government officials while learning German language and culture. Live with host family and make connections with State Department program alumni. For U.S. citizens age 15-18 with GPA 3.0 or above.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Language Studies", "Cultural Exchange", "Government & Politics"],
    deadline: "2025-12-01",
    cost: "Free (Fully funded: travel, lodging, studies)",
    duration: "Academic Year",
    website: "https://usagermanyscholarship.org/apply/"
  },
  {
    id: 61,
    title: "Youth Leadership Programs (State Department)",
    category: "Summer Program",
    state: "All States",
    description: "Leadership training exchange program to gain firsthand knowledge of foreign cultures and examine globally significant issues. For U.S. citizen high school students, age 15-17, with at least one semester remaining upon return. Specific programs may be city/state/region specific.",
    gradeLevel: [9, 10, 11],
    fields: ["Leadership", "Cultural Exchange", "International Relations"],
    deadline: "2025-12-31",
    cost: "Free (Fully funded: travel, lodging, fees)",
    duration: "3-4 weeks in summer",
    website: "https://exchanges.state.gov/us/program/youth-leadership-programs"
  },
  {
    id: 62,
    title: "Kennedy-Lugar Youth Exchange and Study (YES) Abroad",
    category: "Academic Program",
    state: "All States",
    description: "Cultural exchange opportunities to enroll in local high schools and live with host families in selected countries. For U.S. citizen high school students at time of application, age 15-18.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Cultural Exchange", "Language Studies", "International Relations"],
    deadline: "2025-11-15",
    cost: "Free (Fully funded)",
    duration: "Academic year",
    website: "https://www.yes-abroad.org/"
  },
  {
    id: 63,
    title: "NSLC International Diplomacy Program",
    category: "Summer Program",
    state: "All States",
    description: "Summer program in International Diplomacy. Students live the life of a diplomat in the United Nations Security Council. Four summer sessions in June and July in Washington DC and New York City. For high school students grades 9-12.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["International Relations", "Government & Politics", "Leadership"],
    deadline: "2025-05-31",
    cost: "$2,995 (Covers housing, meals, materials, activities)",
    duration: "1-2 weeks",
    website: "https://www.nslcleaders.org/youth-leadership-programs/international-diplomacy/"
  },
  {
    id: 64,
    title: "Georgetown University Summer Programs",
    category: "Summer Program",
    state: "All States",
    description: "Georgetown hosts summer programs for high school students, including International Relations Academy and Politics and Foreign Policy Academies. Summer sessions in June and July in Washington DC. For grades 9-12 with 2.0 GPA or above.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["International Relations", "Government & Politics", "College Preparation"],
    deadline: "2025-05-15",
    cost: "$4,200+ (Covers housing and meals)",
    duration: "2-3 weeks",
    website: "https://summer.georgetown.edu/apply"
  },
  {
    id: 65,
    title: "Fund for American Studies Economics Programs",
    category: "Summer Program",
    state: "All States",
    description: "TFAS Foundation for Teaching Economics sponsors Economics for Leaders (EFL) and Economic History for Leaders (EHFL) programs each summer. For high school students grades 9-12 at various locations across the U.S.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Economics", "History", "Leadership"],
    deadline: "2025-04-30",
    cost: "Varies by location",
    duration: "1 week",
    website: "https://www.fte.org/students/"
  },
  {
    id: 66,
    title: "Smithsonian Student Travel",
    category: "Summer Program",
    state: "All States",
    description: "Smithsonian offers students opportunity to deepen knowledge and cultural awareness through immersive summer travel programs in U.S. and abroad. For students completing grades 8-12 at time of application, at least 13 years old.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Cultural Exchange", "History", "Arts & Humanities"],
    deadline: "2025-03-31",
    cost: "$1,500-$6,000 (Varies by program)",
    duration: "1-3 weeks",
    website: "https://smithsonianstudenttravel.org/"
  },
  {
    id: 67,
    title: "STEM @ Work Massachusetts",
    category: "Academic Program",
    state: "Massachusetts",
    description: "Provides funding to MassHire Workforce Boards to connect high schools to employers for STEM-focused internships. Students gain STEM skills and exposure to paid STEM career opportunities. Employers pay minimum $12/hour for recommended 100-hour total experience.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["STEM", "Career Development", "Professional Skills"],
    deadline: "2025-12-31",
    cost: "Free (Paid $12/hour minimum)",
    duration: "100 hours recommended",
    website: "https://masshiremetrowest.org/stem-at-work/"
  },
  {
    id: 68,
    title: "School to Career Connecting Activities",
    category: "Academic Program",
    state: "Massachusetts",
    description: "Initiative of Massachusetts Department of Elementary and Secondary Education providing youth with structured, paid and unpaid, internship and employment opportunities. Every opportunity designed to provide optimal work-based learning experiences to enhance job performance and future employability.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Career Development", "Professional Skills"],
    deadline: "2025-12-31",
    cost: "Free (Some paid positions)",
    duration: "Varies",
    website: "http://www.massconnecting.org/"
  },
  {
    id: 69,
    title: "YouthWorks Massachusetts",
    category: "Academic Program",
    state: "Massachusetts",
    description: "State-funded youth employment program helping teens get skills and experience for jobs. Paid short-term work placements during summer and/or school year at public, private and nonprofit worksites. Includes training in core soft skills and Signal Success curriculum. Age 14-21.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Career Development", "Professional Skills", "Youth Development"],
    deadline: "2025-12-31",
    cost: "Free (Paid positions)",
    duration: "Summer and/or school year",
    website: "http://commcorp.org/programs/youthworks/"
  },
  {
    id: 70,
    title: "Massachusetts Clean Energy Center Vocational Internship Program",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Helps prepare next generation of clean energy workers by funding internships for high school students at Massachusetts clean energy and water innovation companies. For currently enrolled students in Massachusetts Chapter 74-approved vocational technical education program.",
    gradeLevel: [10, 11, 12],
    fields: ["Environmental Science", "Engineering", "Career Development"],
    deadline: "2025-12-31",
    cost: "Free (Paid internship)",
    duration: "Summer",
    website: "https://www.masscec.com/vocational-internship-program"
  },
  {
    id: 71,
    title: "Stanford Medical Youth Science Program (SMYSP)",
    category: "Summer Program",
    state: "California",
    description: "Five-week in-person program for around 24 low-income, first-generation students from Northern California. 30-40 hours/week Monday-Friday. Includes Stanford faculty lectures on health science, public health, and medicine; group research project to improve health access; professional development workshops; and peer relationships.",
    gradeLevel: [10, 11, 12],
    fields: ["Healthcare & Medicine", "Public Health", "Science"],
    deadline: "2025-03-17",
    cost: "Free",
    duration: "5 weeks (June 23 - July 25)",
    website: "https://med.stanford.edu/smysp.html"
  },
  {
    id: 72,
    title: "Stanford Institutes of Medicine Summer Research Program (SIMR)",
    category: "Summer Program",
    state: "California",
    description: "Eight-week summer program providing abundant firsthand lab experience researching a medically-oriented project. Open to high school juniors and seniors. Aims to increase interest in biological sciences and medicine and deepen understanding of scientific research. Minimum $500 stipend provided.",
    gradeLevel: [11, 12],
    fields: ["Healthcare & Medicine", "Biology & Life Sciences", "Research"],
    deadline: "2025-02-22",
    cost: "Free with $500+ stipend",
    duration: "8 weeks (June 9 - July 31)",
    website: "https://simr.stanford.edu/"
  },
  {
    id: 73,
    title: "Meta Summer Academy",
    category: "Summer Program",
    state: "California",
    description: "Six-week program where externs learn about day-to-day operations of Meta. Build work experience and bolster skills needed for successful tech career. Open to high school students who live in East Palo Alto, Belle Haven, North Fair Oaks, and Redwood City. Minimum 2.0 GPA required.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Computer Science & Technology", "Business & Entrepreneurship", "Career Development"],
    deadline: "2025-02-14",
    cost: "Free (Paid externship)",
    duration: "6 weeks (June 16 - July 25)",
    website: "https://www.metacareers.com/summer-academy/"
  },
  {
    id: 74,
    title: "StandOut Connect",
    category: "Academic Program",
    state: "All States",
    description: "Matches high-achieving high school students ages 15-19 with online internships aligned with their interests. Opportunities in finance, STEM, medicine, law, arts, and more. Powered by StandOutSearch (largest free database of high school internships). Featured in Forbes.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Finance", "STEM", "Healthcare & Medicine", "Law & Legal Studies", "Visual Arts"],
    deadline: "2025-12-31",
    cost: "Free",
    duration: "Summer, spring, fall, or winter",
    website: "https://standoutsearch.com/"
  },
  {
    id: 75,
    title: "Federal Reserve Bank of Boston TIP Intern Program",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Today's Interns, Tomorrow's Professionals (TIP) is paid work and learning internship for eligible high school students who completed sophomore year in Boston Public Schools. Starts with summer work experience including job coaching and skill-building workshops. Top performers selected for extended year-round internship up to three years.",
    gradeLevel: [10, 11, 12],
    fields: ["Finance", "Economics", "Professional Skills"],
    deadline: "2025-12-31",
    cost: "Free (Paid internship)",
    duration: "8 weeks summer + possible year-round",
    website: "https://www.bostonfed.org/careers/students-and-recent-graduates/tip.aspx"
  },
  {
    id: 76,
    title: "Summer Learning Institute (SLI)",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Workforce development program connecting Boston-area students ages 14-18 with community-based jobs. Franklin Institute of Technology and Roxbury Community College offer dual enrollment courses for college credit. Includes leadership, advocacy, and life skills workshops and civic engagement projects.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Leadership", "Civic Engagement", "College Preparation"],
    deadline: "2025-05-13",
    cost: "Free (Paid + college credit)",
    duration: "Summer",
    website: "https://www.boston.gov/departments/youth-engagement-and-employment/summer-learning-institute"
  },
  {
    id: 77,
    title: "NSA High School Work Study Program",
    category: "Academic Program",
    state: "All States",
    description: "Paid high school internship for juniors interested in business, computer science, and engineering. Interns assist as office assistants and computer aides—helping with administrative tasks and maintenance of data processing equipment. September-August program.",
    gradeLevel: [11],
    fields: ["Computer Science & Technology", "Business & Entrepreneurship", "Engineering"],
    deadline: "2025-10-01",
    cost: "Free (Paid internship)",
    duration: "Academic year",
    website: "https://www.intelligencecareers.gov/nsa/nsahsworkstudyprogram.html"
  },
  {
    id: 78,
    title: "The Emma Bowen Foundation Summer Internship",
    category: "Summer Program",
    state: "All States",
    description: "Internship for students ages 17-18 interested in producing, journalism, web development, engineering, business, PR, sales, and other media/tech careers. Work with industry-leading partners like Warner Bros., NFL, Paramount, and Time. Can put you on fast track to success in media industry.",
    gradeLevel: [11, 12],
    fields: ["Journalism", "Communications", "Computer Science & Technology", "Business & Entrepreneurship"],
    deadline: "2025-01-15",
    cost: "Free (Paid internship)",
    duration: "Summer",
    website: "https://www.emmabowenfoundation.org/"
  },
  {
    id: 79,
    title: "BU Summer Challenge",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Two-week program for rising sophomores, juniors, and seniors to live and learn on Boston University campus. Engage in seminars covering topics including business—discussions, lectures, projects, and field trips while gaining firsthand college life experience.",
    gradeLevel: [9, 10, 11],
    fields: ["Business & Entrepreneurship", "College Preparation"],
    deadline: "2025-12-31",
    cost: "Program fee varies",
    duration: "2 weeks (various summer intervals)",
    website: "https://www.bu.edu/summer/high-school-programs/"
  },
  {
    id: 80,
    title: "Boston Private Industry Council (PIC) Internship",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Paid internship placing Boston Public School students ages 16-18 with local employers from Fortune 500 companies to startups. Earn income while gaining work experience and professional skills. Positions in business, finance, accounting, HR, and marketing.",
    gradeLevel: [10, 11, 12],
    fields: ["Business & Entrepreneurship", "Finance", "Career Development"],
    deadline: "2025-12-31",
    cost: "Free (Paid internship)",
    duration: "6-8 weeks summer",
    website: "https://www.bostonpic.org/internships"
  },
  {
    id: 81,
    title: "Northeastern Bridge to Calculus (BtC) Summer Program",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Six-week paid summer program for rising juniors and seniors who are Boston residents. Builds advanced math skills and prepares for college-level coursework. Learn to apply mathematical concepts to financial topics like banking, saving, credit cards, student loans, interest rates, and investing.",
    gradeLevel: [10, 11],
    fields: ["Mathematics", "Finance", "College Preparation"],
    deadline: "2025-05-31",
    cost: "Free (Paid program)",
    duration: "6 weeks summer",
    website: "https://www.northeastern.edu/btc/"
  },
  {
    id: 82,
    title: "Bentley University Summer Stock Market Challenge",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Two-week virtual summer program for high school students ages 14-18. Learn about stock market, investing, and financial markets through hands-on challenges and simulations.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Finance", "Economics", "Business & Entrepreneurship"],
    deadline: "2025-06-19",
    cost: "Free",
    duration: "2 weeks summer",
    website: "https://www.bentley.edu/summer/high-school"
  },
  {
    id: 83,
    title: "Ladder Internship Program",
    category: "Academic Program",
    state: "All States",
    description: "Work closely with high-growth startups across tech, AI/ML, health tech, marketing, and consulting. Contribute to real-world projects, develop professional skills like communication and time management. Includes one-on-one skill training, group sessions with fellow interns, and networking with YCombinator-backed founders. Present completed work to company teams.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Computer Science & Technology", "Business & Entrepreneurship", "Professional Skills"],
    deadline: "2025-12-31",
    cost: "Varies by program type",
    duration: "8 weeks (10-20 hrs/week)",
    website: "https://joinladder.io/"
  },
  {
    id: 84,
    title: "Young Founders Lab (YFL)",
    category: "Academic Program",
    state: "All States",
    description: "Build a revenue-generating startup solving real-world problems. 100% virtual with live interactive sessions. Hands-on entrepreneurial work, workshops on business fundamentals, ideation, and skill development. Case studies, panel discussions, and mentorship from entrepreneurs at Google, Microsoft, and other top companies. Founded by Harvard entrepreneurs.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Business & Entrepreneurship", "Leadership"],
    deadline: "2025-12-31",
    cost: "Varies (Need-based financial aid available)",
    duration: "Multiple cohorts year-round",
    website: "https://www.youngfounderslab.org/"
  },
  {
    id: 85,
    title: "Freedom House Summer Learning Institute (SLI)",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Comprehensive summer program for ages 14-18 enrolled in Boston Public Schools or Boston residents. Community-based job placements with local organizations for work-based learning. Earn college credits through dual enrollment with Franklin Cummings Institute and Roxbury Community College. Leadership, advocacy, and life skills workshops and civic engagement projects.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Leadership", "Community Service", "College Preparation"],
    deadline: "2025-05-30",
    cost: "Free (Paid + college credit)",
    duration: "July 7 - Aug 22",
    website: "https://www.freedomhouse.com/programs/summer-learning-institute"
  },
  {
    id: 86,
    title: "Building-U High School Internship",
    category: "Academic Program",
    state: "All States",
    description: "Year-round virtual internship program for grades 9-12. Join specialized teams tackling real business challenges: Resource R&D, Student Ambassadors, Multi-media, Marketing, Blog Squad, Coding (Laravel, PHP, React), Business Development, Social Media Analytics, and Data Privacy. Work remotely with peers from US, Canada, and beyond.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Computer Science & Technology", "Business & Entrepreneurship", "Communications"],
    deadline: "2025-12-31",
    cost: "Free",
    duration: "3+ months (flexible)",
    website: "https://www.building-u.com/internship"
  },
  {
    id: 87,
    title: "Get Girls Going Summer Incubator",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Six-week summer incubator for Black female high school students in Boston entering grades 10-12. Work with dedicated mentor and advisor to develop business idea addressing racial and gender inequities. Leadership and changemaking skills through workshops, real-world project development. Continued mentorship throughout school year.",
    gradeLevel: [9, 10, 11],
    fields: ["Business & Entrepreneurship", "Leadership", "Social Justice"],
    deadline: "2025-05-31",
    cost: "Free (Mentorship and year-round support)",
    duration: "6 weeks (July 9 - Aug 16)",
    website: "https://www.getgirlsgoing.org/"
  },
  {
    id: 88,
    title: "Boston PIC Summer Internship Program",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Connects Boston Public Schools students to paid internships across 200+ private-sector companies (business, finance, tech, healthcare, life sciences, law, architecture) and 60+ community organizations and city agencies. Gain practical skills, earn income, explore career paths.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Business & Entrepreneurship", "Finance", "Computer Science & Technology", "Healthcare & Medicine", "Law & Legal Studies", "Architecture"],
    deadline: "2025-05-31",
    cost: "Free (Paid internship)",
    duration: "Early July - Mid August",
    website: "https://www.bostonpic.org/summer-jobs"
  },
  {
    id: 89,
    title: "Mary Miller Summer Program",
    category: "Summer Program",
    state: "All States",
    description: "Paid internship honoring legacy of community leader Mary Miller. Rising juniors or seniors develop leadership skills through collaboration with PHC Group senior leadership. Work on social media projects, online community engagement, and technical support.",
    gradeLevel: [10, 11],
    fields: ["Communications", "Computer Science & Technology", "Leadership"],
    deadline: "2025-05-31",
    cost: "Free (Paid internship)",
    duration: "Summer",
    website: "https://phcgroup.com/mary-miller-program"
  },
  {
    id: 90,
    title: "Veritas AI Program",
    category: "Academic Program",
    state: "All States",
    description: "Virtual program providing pathway to explore artificial intelligence. Founded by Harvard graduate students. AI Scholars: 10-session course introducing data science, machine learning, and real-world AI applications with mentorship. AI Fellowship: one-on-one with university mentor for original project with optional publication support.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Computer Science & Technology", "Data Science", "Research"],
    deadline: "2025-12-31",
    cost: "Full financial aid available",
    duration: "12-15 weeks",
    website: "https://www.veritasai.com/"
  },
  {
    id: 91,
    title: "√Mathroots @ MIT",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Two-week residential program at MIT for high school students ages 14-18 with strong mathematical ability. Interactive classes, group problem-solving, and lectures from experienced mathematicians. Topics beyond standard curriculum, developing proof-based reasoning and elegant mathematical ideas.",
    gradeLevel: [9, 10, 11],
    fields: ["Mathematics", "Critical Thinking"],
    deadline: "2025-03-03",
    cost: "Free",
    duration: "2 weeks (July 1-15)",
    website: "https://mathroots.mit.edu/"
  },
  {
    id: 92,
    title: "MITES Summer",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Six-week residential program at MIT for rising high school seniors. Five advanced courses in math, science, and humanities. College preparation workshops on admissions, financial aid, academic skills. Seminars connecting STEM to real-world applications.",
    gradeLevel: [11],
    fields: ["STEM", "Mathematics", "Science", "Liberal Arts", "College Preparation"],
    deadline: "2025-02-01",
    cost: "Free",
    duration: "6 weeks summer",
    website: "https://mites.mit.edu/discover-mites/mites-summer/"
  },
  {
    id: 93,
    title: "Kode With Klossy",
    category: "Summer Program",
    state: "All States",
    description: "Two-week virtual summer coding camps at no cost for girls and gender-expansive teens ages 13-18. Choose from web development, mobile app creation, data science, or machine learning. Learn HTML, CSS, JavaScript, Python, or Swift.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Computer Science & Technology", "Data Science"],
    deadline: "2025-03-31",
    cost: "Free",
    duration: "2 weeks (multiple sessions June-August)",
    website: "https://www.kodewithklossy.com/"
  },
  {
    id: 94,
    title: "Girls Who Code Pathways Program",
    category: "Summer Program",
    state: "All States",
    description: "Six-week virtual program for 9th-12th grade girls and non-binary students. Self-paced learning through web development, data science, cybersecurity, and artificial intelligence. Learn Python, HTML, CSS, and JavaScript.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Computer Science & Technology", "Data Science"],
    deadline: "2025-04-11",
    cost: "Free",
    duration: "6 weeks (June 30 - August 8)",
    website: "https://girlswhocode.com/programs/summer-immersion-program"
  },
  {
    id: 95,
    title: "Mass General Hospital Youth Neurology Research Program",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Full-time 6-8 week summer internship for rising seniors. Bootcamp covering lab skills, research protocols. Paired with faculty mentor in MGH Neurology lab. Weekly seminars, field trips, networking. Conclude with research presentation.",
    gradeLevel: [12],
    fields: ["Healthcare & Medicine", "Biology & Life Sciences", "Research"],
    deadline: "2025-01-31",
    cost: "Free",
    duration: "6-8 weeks (June 30 - August 8)",
    website: "https://www.massgeneral.org/children/youth-programs/neurology"
  },
  {
    id: 96,
    title: "Lumiere Breakthrough Scholar Program",
    category: "Academic Program",
    state: "All States",
    description: "Work one-on-one with PhD mentor over 12 weeks to develop independent research project in any field. Nine mentoring sessions, two writing coach meetings, research methodology workshops. Culminates in 15-page paper presented at Research Symposium.",
    gradeLevel: [12],
    fields: ["Research", "Science", "Liberal Arts", "Writing"],
    deadline: "2025-12-31",
    cost: "Free",
    duration: "12 weeks",
    website: "https://www.lumiere-education.com/breakthrough-scholars"
  },
  {
    id: 97,
    title: "UMass Chan High School Health Careers Program",
    category: "Summer Program",
    state: "Massachusetts",
    description: "Four-week residential experience for Massachusetts sophomores/juniors from underrepresented backgrounds. Classes in science, math, English, technology. Field trips and internships with physicians, scientists, healthcare professionals. Health Disparities Research Project.",
    gradeLevel: [10, 11],
    fields: ["Healthcare & Medicine", "Biology & Life Sciences", "Public Health"],
    deadline: "2025-03-03",
    cost: "Free with stipend",
    duration: "4 weeks (June 29 - July 25)",
    website: "https://www.umassmed.edu/diversity/pipeline-programs/hshcp/"
  },
  {
    id: 98,
    title: "American Psychological Association Remote Internship",
    category: "Academic Program",
    state: "All States",
    description: "Year-round remote internship contributing to projects in research, communications, public policy, or education. Tasks include analyzing data, preparing educational materials, assisting with studies.",
    gradeLevel: [9, 10, 11, 12],
    fields: ["Public Health", "Research", "Communications", "Public Service"],
    deadline: "2025-12-31",
    cost: "Free (Some paid positions or academic credit)",
    duration: "Year-round",
    website: "https://www.apa.org/careers/interns"
  }
]


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load user's bookmarks
        const q = query(collection(db, "bookmarks"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const bookmarkIds = querySnapshot.docs.map(doc => doc.data().programId);
        
        // Filter programs to show only bookmarked ones
        const bookmarked = programs.filter(p => bookmarkIds.includes(p.id));
        setBookmarkedPrograms(bookmarked);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRemoveBookmark = async (programId) => {
    if (!user) return;

    try {
      const q = query(collection(db, "bookmarks"), where("userId", "==", user.uid), where("programId", "==", programId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (document) => {
        await deleteDoc(doc(db, "bookmarks", document.id));
      });
      setBookmarkedPrograms(bookmarkedPrograms.filter(p => p.id !== programId));
      alert("Removed from bookmarks!");
    } catch (error) {
      alert("Error removing bookmark");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">Spark</Link>
            <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-8 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">My Bookmarks</h1>
          <DeadlineNotifications bookmarkedPrograms={bookmarkedPrograms} />
          <p className="text-xl text-gray-600 mb-8">Please sign in to view your bookmarked programs.</p>
          <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold mb-8">My Bookmarks</h1>
        <DeadlineNotifications bookmarkedPrograms={bookmarkedPrograms} />
        
        {bookmarkedPrograms.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-8">You haven't bookmarked any programs yet.</p>
            <Link href="/opportunities" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
              Explore Opportunities
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedPrograms.map(program => (
              <div key={program.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{program.description}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  <p className="text-gray-700">
                    <strong>State:</strong> {program.state}
                  </p>
                  <p className="text-gray-700">
                    <strong>Deadline:</strong> {new Date(program.deadline).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">
                    <strong>Cost:</strong> {program.cost}
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveBookmark(program.id)}
                  className="w-full mb-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Remove Bookmark
                </button>

                <a 
                  href={program.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Learn More
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}