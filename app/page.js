'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import NotificationBell from "./components/NotificationBell"
import Toast from "./components/Toast" 
import Navbar from "@/app/components/Navbar"

const USMap = dynamic(() => import('./USMap'), {
  ssr: false,
  loading: () => <div className="text-center py-8">Loading map...</div>
})

function AuthPopup({ isOpen, onClose, showToast }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
  await createUserWithEmailAndPassword(auth, email, password);
  onClose();
  setTimeout(() => {
    showToast(" Account created! Welcome to Spark!");
  }, 300);
} else {
  await signInWithEmailAndPassword(auth, email, password);
  onClose();
  setTimeout(() => {
    showToast(" Welcome back!");
  }, 300);
}
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {isSignUp ? "Sign Up Free" : "Welcome Back"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
            minLength={6}
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? "Loading..." : (isSignUp ? "Create Account →" : "Sign In →")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LogoutConfirmPopup({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Log Out?</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to log out? You'll need to sign in again to access your bookmarks.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
            >
              Yes, Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
   const [isAuthOpen, setIsAuthOpen] = useState(false); 
   const [isLogoutOpen, setIsLogoutOpen] = useState(false);
   const [user, setUser] = useState(null);
   const [bookmarkedPrograms, setBookmarkedPrograms] = useState([])
   const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
const [selectedState, setSelectedState] = useState(null)
const [selectedField, setSelectedField] = useState("All")
const [selectedGrade, setSelectedGrade] = useState("All")
const [searchTerm, setSearchTerm] = useState("")

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);
    
    if (currentUser) {
      // Load bookmarked programs
      const { collection, query, where, getDocs } = await import("firebase/firestore");
      const q = query(collection(db, "bookmarks"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const bookmarkIds = querySnapshot.docs.map(doc => doc.data().programId);
      
      // Filter programs to get full details (you'll need access to programs array)
      // For now, just store the IDs
      setBookmarkedPrograms(bookmarkIds);
    } else {
      setBookmarkedPrograms([]);
    }
  });
  return () => unsubscribe();
}, []);

const handleLogout = async () => {
  try {
    await signOut(auth);
    setIsLogoutOpen(false);
  } catch (error) {
    alert("Error logging out");
  }
};

const showToast = (message, type = 'success') => {
  setToast({ show: true, message, type })
  setTimeout(() => {
    setToast({ show: false, message: '', type: 'success' })
  }, 3000)
}


  // Sample program database
  const programs = [
    {
      id: 1,
      title: "MIT Launch Entrepreneurship",
      state: "Massachusetts",
      description: "4-week summer program teaching students to start real companies",
      gradeLevel: [10, 11, 12],
      fields: ["STEM", "Leadership"],
      deadline: "2025-03-01",
      cost: "Free",
      duration: "4 weeks",
      website: "https://mitlaunch.org"
    },
    {
      id: 2,
      title: "Girls Who Code Summer Immersion",
      state: "Massachusetts",
      description: "Free 7-week coding program for high school girls",
      gradeLevel: [9, 10, 11],
      fields: ["STEM"],
      deadline: "2025-02-15",
      cost: "Free",
      duration: "7 weeks",
      website: "https://girlswhocode.com"
    },
    {
      id: 3,
      title: "Stanford AI4ALL",
      state: "California",
      description: "3-week residential AI education program",
      gradeLevel: [11, 12],
      fields: ["STEM"],
      deadline: "2025-03-15",
      cost: "Free with stipend",
      duration: "3 weeks",
      website: "https://ai-4-all.org"
    },
    {
      id: 4,
      title: "Young Arts Competition",
      state: "All States",
      description: "National arts competition with $10,000 awards.YoungArts identifies exceptional young artists, amplifies their potential, and invests in their lifelong creative freedom.",
      gradeLevel: [9, 10, 11, 12],
      fields: ["Arts"],
      deadline: "2025-10-01",
      cost: "$35 application fee",
      duration: "Year-round",
      website: "https://youngarts.org"
    },
    {
      id: 5,
      title: "Tennessee Governor's School",
      state: "Tennessee",
      description: "The Tennessee Governor's Schools provide eleven challenging and high-intensity programs for rising 11th and 12th grade students nominated by high school faculty. Each school offers a unique learning environment for students interested in the arts, humanities, agriculture science, STEM programs, advanced mathematics, physics, leadership, international studies, Tennessee history, or potential teaching careers. Students interested in participating in a Governor's School should obtain the application from a high school administrator, school counselor, or other faculty member. Applications, submission information, and critical deadlines will be posted on the webpages of each individual Governor’s Schools site.",
      gradeLevel: [11, 12],
      fields: ["STEM", "Arts", "Humanities"],
      deadline: "2025-01-15",
      cost: "Free",
      duration: "4 weeks",
      website: "https://tngifted.org"
    },
    {
  id: 21,
  title: "Frist Art Museum Volunteer Program",
  state: "Tennessee",
  description: "Volunteers (15 years or older) support the Frist Art Museum in a variety of roles by providing assistance to both our staff and visitors in diverse ways. They are involved in helping around the museum and can teach others art.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Arts", "Humanities"],
  deadline: "2025-12-30",
  cost: "Free",
  duration: "Ongoing",
  website: "https://fristartmuseum.org/visit/volunteer"
},
{
  id: 22,
  title: "Student Member on Tennessee State Board of Education",
  state: "Tennessee",
  description: "A rising junior or senior (current 10th or 11th grade) in high school can be appointed by the Governor to serve as the student advisor on the Tennessee State Board of Education. This student serves a one-year term and they represent students across Tennessee.",
  gradeLevel: [10, 11],
  fields: ["Leadership"],
  deadline: "2025-12-31", // Rolling deadline
  cost: "Free",
  duration: "1 year",
  website: "https://www.tn.gov/education/about-tdoe/state-board-of-education.html"
},
{
  id: 23,
  title: "Youth Leadership Programs Tennessee",
  state: "Tennessee",
  description: "This program is a leadership development program for high school students to cultivate their leadership skills and help their community. They are currently located in Oak Ridge, Knoxville, Davidson County, Williamson County, Hawkins County, Greene County, Jefferson County, Carter County, Anderson County, and Hamilton County.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Leadership"],
  deadline: "2025-12-31", // Contact for specific deadlines
  cost: "Varies by location",
  duration: "Varies",
  website: "https://www.tn.gov" // Contact school or mayor's office
},
{
  id: 24,
  title: "Youth Advisory Board for County Health Department",
  state: "Tennessee",
  description: "The Youth Advisory Board (YAB) is a group of high school students who advise the health department on public health issues that affect people in the community. The YAB creates monthly public health service-learning projects. Currently located in Davidson County and Knox County.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Leadership", "Social Science"],
  deadline: "2025-12-31", // Rolling
  cost: "Free",
  duration: "1 year",
  website: "https://www.nashville.gov/departments/health" // Contact mayor's office
},
{
  id: 25,
  title: "Superintendent Student Advisory Council",
  state: "Tennessee",
  description: "This council represents a diverse team of student voices from each high school in the district. The purpose is for high school students to share feedback, experiences, and perspectives on various issues affecting schools and communities. Available in almost every county in TN including Shelby, Williamson, Hamilton, Knox, Humboldt City, and Wilson County.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Leadership"],
  deadline: "2025-12-31", // Contact for specific deadlines
  cost: "Free",
  duration: "1 year",
  website: "https://www.tn.gov" // Contact county superintendent
},
{
  id: 26,
  title: "YMCA Youth Advocate Program",
  state: "All States",
  description: "This program provides practical, real-world experience advocating for policy solutions that help the Y address critical social issues in three areas: youth development, healthy living, and social responsibility. Open to all high school students (grades 9-12) to advocate policy solutions to Members of Congress.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Leadership", "Social Science"],
  deadline: "2025-09-30",
  cost: "Free",
  duration: "Year-round",
  website: "https://ymca.quorum.us/youth-advocates/"
},
{
  id: 27,
  title: "Bank of America Student Leaders Program",
  state: "All States",
  description: "Eight-week paid internship for high school juniors and seniors at a local nonprofit organization where they learn first-hand about the needs of their community and the critical role nonprofits play. Includes Student Leaders Summit in Washington, D.C.",
  gradeLevel: [11, 12],
  fields: ["Leadership"],
  deadline: "2025-01-31", // Applications open in October
  cost: "Free (Paid internship)",
  duration: "8 weeks",
  website: "https://about.bankofamerica.com/en/making-an-impact/student-leaders"
},
{
  id: 28,
  title: "High School Summer Intern Program (Law)",
  state: "Tennessee",
  description: "Beneficial to students interested in a legal career. Provides students with direct and immediate access to the legal field, a paid seven week internship with a legal employer, networking opportunities with career-minded peers and lawyers. Available in Nashville, Memphis and Chattanooga.",
  gradeLevel: [10, 11, 12],
  fields: ["Social Science", "Leadership"],
  deadline: "2025-03-31", // Contact for specific deadlines
  cost: "Free (Paid internship)",
  duration: "7 weeks",
  website: "https://www.nashvillebar.org" // Contact city bar association
},
{
  id: 29,
  title: "American Legion Auxiliary Girls State Tennessee",
  state: "Tennessee",
  description: "Open to female high school students who have completed their junior year. Competitively selected and sponsored by American Legion Auxiliary units. Learn about the political process by electing officials for all levels of state government and actively running a mock government.",
  gradeLevel: [11],
  fields: ["Leadership", "Social Science"],
  deadline: "2025-01-31", // Application opens in January
  cost: "Free",
  duration: "1 week",
  website: "https://www.tnalagirlsstate.org" // Contact school counselor
},
{
  id: 30,
  title: "Tennessee American Legion Boys State",
  state: "Tennessee",
  description: "Open to male high school students who are rising seniors. Learn about government, leadership, and how to affect the local community. Activities include legislative sessions, court proceedings, law enforcement presentations, assemblies, bands, chorus and recreational programs.",
  gradeLevel: [11],
  fields: ["Leadership", "Social Science"],
  deadline: "2025-03-31", // Contact school counselor
  cost: "Free",
  duration: "1 week",
  website: "https://www.tnboysstate.org" // Contact school counselor
},
{
  id: 31,
  title: "Biomedical Research Summer Program at Vanderbilt",
  state: "Tennessee",
  description: "Engages and introduces high school students (rising 11th and 12th) to the foundation of basic science medical information from diverse early career professionals. Includes stimulating discussions on STEM topics, 1:1 mentoring, training in lab skills, and graduate school experiences.",
  gradeLevel: [10, 11],
  fields: ["STEM"],
  deadline: "2025-04-30", // Opens February, closes April
  cost: "Free",
  duration: "Summer session",
  website: "https://redcap.vanderbilt.edu/surveys/?s=EAJLECH3KD4DTXX7"
},
{
  id: 32,
  title: "Belmont RISE Program",
  state: "Tennessee",
  description: "Provides high school students (grades 9-12) exposure to data science, statistics, and scientific research through coursework and guided group research projects. Led by faculty in the analysis and predictive utilization of healthcare data, focusing on cardiovascular health.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM"],
  deadline: "2025-04-15",
  cost: "Free",
  duration: "Summer session",
  website: "https://www.belmont.edu/science-math/summer-programs/camps.html"
},
{
  id: 33,
  title: "Telluride Association Summer Seminar (TASS)",
  state: "All States",
  description: "Free six week summer program open to rising high school juniors and seniors. TASS prepares and inspires promising young students to lead and serve through transformative educational experiences rooted in critical thinking and democratic community. Covers all costs including tuition, books, room and board, field trips, and facilities fees.",
  gradeLevel: [10, 11],
  fields: ["Leadership", "Humanities"],
  deadline: "2025-01-15", // Opens mid November
  cost: "Free (All expenses covered)",
  duration: "6 weeks",
  website: "https://www.tellurideassociation.org/our-programs/high-school-students/"
},
{
  id: 34,
  title: "HITES Program - University of Tennessee",
  state: "Tennessee",
  description: "Selects rising 12th grade students eager to tackle real-world engineering challenges. Provides opportunity to explore engineering and campus life at UTK. Students engage with faculty, learn engineering fundamentals, and compete in daily engineering challenges. Includes team engineering design project.",
  gradeLevel: [11],
  fields: ["STEM"],
  deadline: "2025-01-01",
  cost: "Free",
  duration: "Summer session",
  website: "https://tickle.utk.edu/future-students/pre-college/hites12/"
},
{
  id: 35,
  title: "NASA Internship Program",
  state: "All States",
  description: "NASA offers a multitude of internship opportunities for high school sophomores, juniors, and seniors over 16 years of age. Internships are designed to increase the capabilities and diversity of the nation's STEM workforce. Participants perform research under the guidance of a mentor at a NASA facility.",
  gradeLevel: [10, 11, 12],
  fields: ["STEM"],
  deadline: "2025-03-01", // Rolling deadlines
  cost: "Free (Paid internship)",
  duration: "10 weeks",
  website: "https://intern.nasa.gov/"
},
{
  id: 36,
  title: "Research Science Institute (RSI)",
  state: "All States",
  description: "Cost-free, 5 week internship for high school juniors combining on-campus course work in scientific theory with off-campus work in science and technology research. Participants experience the entire research cycle from start to finish. Read current literature, draft and execute detailed research plan, and deliver conference-style oral and written reports.",
  gradeLevel: [11],
  fields: ["STEM"],
  deadline: "2025-01-15",
  cost: "Free (All expenses covered)",
  duration: "5 weeks",
  website: "https://www.cee.org/programs/apply-rsi"
},
  {
  id: 37,
  title: "Princeton Summer Journalism Program",
  state: "All States",
  description: "Free program for aspiring journalists open to high school juniors. Hybrid program begins with online workshops and concludes with a 10-day residential institute at Princeton. Includes college application preparation and culminates with publication of The Princeton Summer Journal.",
  gradeLevel: [11],
  fields: ["Humanities", "Leadership"],
  deadline: "2025-02-15",
  cost: "Free",
  duration: "10 days residential + online",
  website: "https://summerjournalism.princeton.edu/"
},
{
  id: 38,
  title: "Broad Summer Scholars Program",
  state: "Massachusetts",
  description: "Six-week program for rising Massachusetts high school seniors with an interest in science. Participants paired with scientists to conduct original cutting-edge research in cancer biology, psychiatric disease, chemical biology, computational biology, and infectious disease. Includes $3,600 stipend.",
  gradeLevel: [11],
  fields: ["STEM"],
  deadline: "2025-01-22",
  cost: "Free with $3,600 stipend",
  duration: "6 weeks",
  website: "https://www.broadinstitute.org/summer-scholars"
},
{
  id: 39,
  title: "Massachusetts Life Sciences Center High School Apprenticeship",
  state: "Massachusetts",
  description: "More than 150 internship opportunities for underrepresented, low-income students at small life science and research institutions across Massachusetts. Students must be at least 16 years old. Paid $17/hour for 6 weeks with pre-internship lab training available.",
  gradeLevel: [10, 11, 12],
  fields: ["STEM"],
  deadline: "2025-12-31", // Rolling placements
  cost: "Free (Paid $17/hour)",
  duration: "6 weeks",
  website: "https://www.masslifesciences.com/programs/high-school-apprenticeship/"
},
{
  id: 40,
  title: "BU RISE Internship",
  state: "Massachusetts",
  description: "Six-week residential program for high school juniors. Interns work 40 hours a week on research projects under mentorship of faculty, postdoctoral fellows, and graduate students. Includes workshops for academic and professional skills development. Research available in astronomy, biology, engineering, neuroscience, psychology, public health, and more.",
  gradeLevel: [11],
  fields: ["STEM"],
  deadline: "2025-02-28",
  cost: "Free (Residential)",
  duration: "6 weeks",
  website: "https://www.bu.edu/summer/high-school-programs/rise/"
},
{
  id: 41,
  title: "GROW - Greater Boston Research Opportunities for Young Women",
  state: "Massachusetts",
  description: "Six week internship for rising high school seniors interested in science research. Conduct research at Boston University labs in collaborative groups. Includes goal-setting with Program Managers, lectures from guest speakers, and summer symposium presentation. $1,500 stipend upon completion.",
  gradeLevel: [11],
  fields: ["STEM"],
  deadline: "2025-04-28",
  cost: "Free with $1,500 stipend",
  duration: "6 weeks",
  website: "https://www.bu.edu/lernet/grow/"
},
{
  id: 42,
  title: "Mass General Hospital Youth Scholars Program",
  state: "Massachusetts",
  description: "Program for high schoolers in grades 9-12 from Boston, Chelsea, and Revere to increase awareness of careers in science and healthcare. Provides academic support through high school and college. 100% high school graduation rate, 87% enter post-secondary education.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM", "Leadership"],
  deadline: "2025-12-31", // Contact for deadlines
  cost: "Free",
  duration: "Year-round",
  website: "https://www.massgeneral.org/children/youth-programs"
},
{
  id: 43,
  title: "Museum of Science Academic Year/Summer Youth Internship",
  state: "Massachusetts",
  description: "Paid and unpaid internship opportunities for high schoolers ages 14-19. Work during academic year or summer on various projects. Includes weekly workshops on financial literacy, resume writing, plus field trips to cultural sites and local colleges.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM", "Arts"],
  deadline: "2025-12-31", // Varies by program
  cost: "Free (Some paid positions)",
  duration: "Varies",
  website: "https://www.mos.org/teen-programs"
},
{
  id: 44,
  title: "MIT Research Science Institute (RSI)",
  state: "Massachusetts",
  description: "Prestigious cost-free program accepting 100 of the world's most accomplished high school juniors. Experience complete research cycle from start to finish. First week: intensive STEM classes. Following five weeks: individual research project under experienced scientists. Requires minimum 740 SAT Math, 700 Reading/Writing or 33 ACT Math, 34 Verbal.",
  gradeLevel: [11],
  fields: ["STEM"],
  deadline: "2025-01-15",
  cost: "Free",
  duration: "6 weeks",
  website: "https://www.cee.org/programs/research-science-institute"
},
{
  id: 45,
  title: "Paul Revere House One-Week Internship",
  state: "Massachusetts",
  description: "One-week internship for students entering 10th, 11th, and 12th grade. Work directly with museum staff to understand how history museums function and create content. Includes both independent and group work. No prior expertise required.",
  gradeLevel: [10, 11, 12],
  fields: ["Humanities", "Arts"],
  deadline: "2025-04-30",
  cost: "Free",
  duration: "1 week (July 21-25)",
  website: "https://www.paulreverehouse.org/internships"
},
{
  id: 46,
  title: "Northeastern Young Scholars Program (YSP)",
  state: "Massachusetts",
  description: "Free program for Massachusetts resident rising juniors interested in science or engineering careers. Gain firsthand research experience in Northeastern University laboratories. Includes education and career counseling, career path seminars, and field trips. Priority to students with low access to similar programs.",
  gradeLevel: [10],
  fields: ["STEM"],
  deadline: "2025-03-15",
  cost: "Free",
  duration: "6 weeks",
  website: "https://www.northeastern.edu/ysp/"
},
{
  id: 47,
  title: "Tufts Biomedical Engineering Research Scholars (TUBERS)",
  state: "Massachusetts",
  description: "Free program for talented high schoolers over 16. Learn general research techniques at Tufts biomedical engineering labs, then focus on specific project. Participants encouraged to use projects for science competitions. Requires reference letter from science teacher.",
  gradeLevel: [11, 12],
  fields: ["STEM"],
  deadline: "2025-03-01",
  cost: "Free",
  duration: "6 weeks",
  website: "https://engineering.tufts.edu/bme/tubers"
},
{
  id: 48,
  title: "Museum of Fine Arts Boston Teen Programs",
  state: "Massachusetts",
  description: "12-month paid program for rising sophomores, juniors, and seniors with interest in arts. Open to Boston residents and Boston public school students. Firsthand look at museum operations, studio art classes, and workshops with artists, leaders, and innovators.",
  gradeLevel: [9, 10, 11],
  fields: ["Arts"],
  deadline: "2025-05-31", // Rolling until May
  cost: "Free (Paid position)",
  duration: "12 months",
  website: "https://www.mfa.org/programs/teens"
},
{
  id: 49,
  title: "Artists for Humanity Teen Jobs",
  state: "Massachusetts",
  description: "Paid employment in art and design for high school freshmen, sophomores, and juniors. Must be 14+, Boston resident or attend Boston public school. Work with professional artists in 3D Design, Animation, Creative Tech, Graphic Design, Painting, Photography, and Video studios. Requires 36-hour unpaid apprenticeship first.",
  gradeLevel: [9, 10, 11],
  fields: ["Arts"],
  deadline: "2025-12-31", // Rolling
  cost: "Free (Paid position after apprenticeship)",
  duration: "Ongoing",
  website: "https://afhboston.org/employment"
},
{
  id: 50,
  title: "TIP Internship Program - Banking & Finance",
  state: "Massachusetts",
  description: "Program for Boston public school students with interest in finance and banking. Provides income-eligible students who've completed sophomore year with work experience in a bank, job coaching, and skills workshops on workplace success and personal financial stability.",
  gradeLevel: [10, 11, 12],
  fields: ["Leadership"],
  deadline: "2025-12-31",
  cost: "Free (Paid internship)",
  duration: "Summer",
  website: "https://www.bostonpic.org/tip-program"
},
{
  id: 51,
  title: "Army Educational Outreach Program (AEOP) High School Apprenticeship",
  state: "Massachusetts",
  description: "Internship opportunities at sites in Cambridge and Boston. Immerse in research working with high-tech equipment and cutting-edge techniques under mentorship of professional scientists and engineers. Includes college readiness and professional skills workshops. Educational stipend provided.",
  gradeLevel: [10, 11, 12],
  fields: ["STEM"],
  deadline: "2025-12-31", // Rolling
  cost: "Free (Paid stipend)",
  duration: "Varies",
  website: "https://www.usaeop.com/program/high-school-apprenticeship/"
},
{
  id: 52,
  title: "Dana-Farber Student Training Academic-Year Internship",
  state: "Massachusetts",
  description: "Eight-month program (October-June) for Boston residents affiliated with Fenway High School, John D. O'Bryant School, Madison Park Technical, Sociedad Latina, or Youth Enrichment Services. Intern in hospital department aligned with interests. Build professional skills via mentorship, student retreats, and college tours. Minimum 2.0 GPA required.",
  gradeLevel: [9, 10, 11],
  fields: ["STEM", "Leadership"],
  deadline: "2025-09-30",
  cost: "Free",
  duration: "8 months (8-15 hrs/week)",
  website: "https://www.dana-farber.org/for-students-and-trainees/"
},
{
  id: 53,
  title: "Ragon Institute Summer Experience (RISE)",
  state: "Massachusetts",
  description: "Paid 25-hour/week internship for rising seniors interested in STEM. Pairs students with mentors for lab projects. Includes coursework in immunology, lectures, and workshops. Priority to gateway communities like Cambridge, Boston, Everett, Revere, Lynn, Brockton, and Chelsea. Requires personal statement and letters of recommendation.",
  gradeLevel: [11],
  fields: ["STEM"],
  deadline: "2025-02-28",
  cost: "Free (Paid internship)",
  duration: "7 weeks",
  website: "https://ragoninstitute.org/education/rise/"
},
{
  id: 54,
  title: "LEAH Knox Scholars Program",
  state: "Massachusetts",
  description: "Two-year research experience for rising juniors and seniors within commuting distance of MIT. Conduct research and learn quantitative methods, data analysis, coding, and molecular biology. First summer: intensive lab at MIT. School year: paid STEM teaching internship, mentorship, monthly events. Second summer: college app support and external lab placements. Earn up to $2,250 summer + $2,500 academic year.",
  gradeLevel: [10, 11],
  fields: ["STEM"],
  deadline: "2025-03-31",
  cost: "Free (Paid up to $4,750 total)",
  duration: "2 years",
  website: "https://leahknox.mit.edu/"
},
{
  id: 55,
  title: "Boston Public Library Teen Volunteer Program",
  state: "Massachusetts",
  description: "High schoolers in grades 9-12 volunteer at Boston Public Library locations throughout the city. Build career and customer service skills, participate in career-readiness workshops on resume writing and interview skills. Assist with creating book lists, shelving, building displays, and locating books.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Leadership"],
  deadline: "2025-12-31", // Rolling
  cost: "Free",
  duration: "Varies",
  website: "https://www.bpl.org/teen-programs/"
},
{
  id: 56,
  title: "New England Aquarium Teen Internships",
  state: "Massachusetts",
  description: "Two internship tracks for students interested in marine sciences and ocean protection. Visitor Services Assistants focus on customer service. Interpretation and Engagement Aquarium Guides teach visitors about animals and ocean conservation. Paid positions for Boston and Cambridge residents.",
  gradeLevel: [10, 11, 12],
  fields: ["STEM"],
  deadline: "2025-03-31",
  cost: "Free (Paid internship)",
  duration: "7 weeks",
  website: "https://www.neaq.org/get-involved/volunteer/teen-internships/"
},
{
  id: 57,
  title: "Boston Society for Architecture High School Internship",
  state: "Massachusetts",
  description: "Six-week immersive program at local architecture firms (July 7-August 15, 2025). Experience architecture field through hands-on work at firms of varying sizes and focuses. Includes neighborhood tours and connection with other interns. Explore architecture in the city.",
  gradeLevel: [10, 11, 12],
  fields: ["Arts", "STEM"],
  deadline: "2025-05-31",
  cost: "Free",
  duration: "6 weeks (July 7 - Aug 15)",
  website: "https://www.architects.org/career-development/internships"
},
{
  id: 58,
  title: "Massachusetts Supreme Judicial Court Judicial Youth Corps",
  state: "Massachusetts",
  description: "Summer job program where students learn about Massachusetts court system and rule of law. Work 4 days/week for 6.5 weeks in Suffolk County courts. Educational sessions about law and legal field. Mentored by judges, lawyers, clerks, probation officers. Optional mock trial in federal court. $15/hour, 25 hours/week. Must be Boston resident or Boston Public School student in good academic standing with social security number.",
  gradeLevel: [10, 11, 12],
  fields: ["Social Science", "Leadership"],
  deadline: "2025-05-31", // Rolling
  cost: "Free (Paid $15/hour)",
  duration: "6.5 weeks",
  website: "https://www.mass.gov/service-details/judicial-youth-corps"
}, 
{
  id: 59,
  title: "National Security Language Institute for Youth (NSLI-Y)",
  state: "All States",
  description: "Opportunities to study less commonly taught languages in immersion programs abroad. Languages include Arabic, Mandarin Chinese, Korean, Persian, Russian, and Turkish. Live with host families. For U.S. citizen high school students, age 15-18, with 2.5 GPA or above.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Humanities", "Leadership"],
  deadline: "2025-11-01", // Typically November
  cost: "Free (Fully funded: travel, lodging, studies)",
  duration: "Summer or Academic Year",
  website: "https://www.nsliforyouth.org/"
},
{
  id: 60,
  title: "Congress-Bundestag Youth Exchange (CBYX) - Germany",
  state: "All States",
  description: "Cultural exchange to study abroad in Germany. Meet with government officials while learning German language and culture. Live with host family and make connections with State Department program alumni. For U.S. citizens age 15-18 with GPA 3.0 or above.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Humanities", "Leadership"],
  deadline: "2025-12-01", // Typically December
  cost: "Free (Fully funded: travel, lodging, studies)",
  duration: "Academic Year",
  website: "https://usagermanyscholarship.org/apply/"
},
{
  id: 61,
  title: "Youth Leadership Programs (State Department)",
  state: "All States",
  description: "Leadership training exchange program to gain firsthand knowledge of foreign cultures and examine globally significant issues. For U.S. citizen high school students, age 15-17, with at least one semester remaining upon return. Specific programs may be city/state/region specific.",
  gradeLevel: [9, 10, 11],
  fields: ["Leadership"],
  deadline: "2025-12-31", // Varies by program
  cost: "Free (Fully funded: travel, lodging, fees)",
  duration: "3-4 weeks in summer",
  website: "https://exchanges.state.gov/us/program/youth-leadership-programs"
},
{
  id: 62,
  title: "Kennedy-Lugar Youth Exchange and Study (YES) Abroad",
  state: "All States",
  description: "Cultural exchange opportunities to enroll in local high schools and live with host families in selected countries. For U.S. citizen high school students at time of application, age 15-18.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Humanities", "Leadership"],
  deadline: "2025-11-15", // Typically November
  cost: "Free (Fully funded)",
  duration: "Academic year",
  website: "https://www.yes-abroad.org/"
},
{
  id: 63,
  title: "NSLC International Diplomacy Program",
  state: "All States",
  description: "Summer program in International Diplomacy. Students live the life of a diplomat in the United Nations Security Council. Four summer sessions in June and July in Washington DC and New York City. For high school students grades 9-12.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Leadership", "Social Science"],
  deadline: "2025-05-31",
  cost: "$2,995 (Covers housing, meals, materials, activities)",
  duration: "1-2 weeks",
  website: "https://www.nslcleaders.org/youth-leadership-programs/international-diplomacy/"
},
{
  id: 64,
  title: "Georgetown University Summer Programs",
  state: "All States",
  description: "Georgetown hosts summer programs for high school students, including International Relations Academy and Politics and Foreign Policy Academies. Summer sessions in June and July in Washington DC. For grades 9-12 with 2.0 GPA or above.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Social Science", "Leadership"],
  deadline: "2025-05-15",
  cost: "$4,200+ (Covers housing and meals)",
  duration: "2-3 weeks",
  website: "https://summer.georgetown.edu/apply"
},
{
  id: 65,
  title: "Fund for American Studies Economics Programs",
  state: "All States",
  description: "TFAS Foundation for Teaching Economics sponsors Economics for Leaders (EFL) and Economic History for Leaders (EHFL) programs each summer. For high school students grades 9-12 at various locations across the U.S.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Social Science", "Leadership"],
  deadline: "2025-04-30",
  cost: "Varies by location",
  duration: "1 week",
  website: "https://www.fte.org/students/"
},
{
  id: 66,
  title: "Smithsonian Student Travel",
  state: "All States",
  description: "Smithsonian offers students opportunity to deepen knowledge and cultural awareness through immersive summer travel programs in U.S. and abroad. For students completing grades 8-12 at time of application, at least 13 years old.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Humanities", "Arts", "STEM"],
  deadline: "2025-03-31",
  cost: "$1,500-$6,000 (Varies by program)",
  duration: "1-3 weeks",
  website: "https://smithsonianstudenttravel.org/"
},
{
  id: 67,
  title: "STEM @ Work Massachusetts",
  state: "Massachusetts",
  description: "Provides funding to MassHire Workforce Boards to connect high schools to employers for STEM-focused internships. Students gain STEM skills and exposure to paid STEM career opportunities. Employers pay minimum $12/hour for recommended 100-hour total experience.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM"],
  deadline: "2025-12-31", // Rolling
  cost: "Free (Paid $12/hour minimum)",
  duration: "100 hours recommended",
  website: "https://masshiremetrowest.org/stem-at-work/"
},
{
  id: 68,
  title: "School to Career Connecting Activities",
  state: "Massachusetts",
  description: "Initiative of Massachusetts Department of Elementary and Secondary Education providing youth with structured, paid and unpaid, internship and employment opportunities. Every opportunity designed to provide optimal work-based learning experiences to enhance job performance and future employability.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM", "Leadership"],
  deadline: "2025-12-31", // Rolling
  cost: "Free (Some paid positions)",
  duration: "Varies",
  website: "http://www.massconnecting.org/"
},
{
  id: 69,
  title: "YouthWorks Massachusetts",
  state: "Massachusetts",
  description: "State-funded youth employment program helping teens get skills and experience for jobs. Paid short-term work placements during summer and/or school year at public, private and nonprofit worksites. Includes training in core soft skills and Signal Success curriculum. Age 14-21.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Leadership"],
  deadline: "2025-12-31", // Rolling
  cost: "Free (Paid positions)",
  duration: "Summer and/or school year",
  website: "http://commcorp.org/programs/youthworks/"
},
{
  id: 70,
  title: "Massachusetts Clean Energy Center Vocational Internship Program",
  state: "Massachusetts",
  description: "Helps prepare next generation of clean energy workers by funding internships for high school students at Massachusetts clean energy and water innovation companies. For currently enrolled students in Massachusetts Chapter 74-approved vocational technical education program.",
  gradeLevel: [10, 11, 12],
  fields: ["STEM"],
  deadline: "2025-12-31", // Rolling
  cost: "Free (Paid internship)",
  duration: "Summer",
  website: "https://www.masscec.com/vocational-internship-program"
},
{
  id: 71,
  title: "Stanford Medical Youth Science Program (SMYSP)",
  state: "California",
  description: "Five-week in-person program for around 24 low-income, first-generation students from Northern California. 30-40 hours/week Monday-Friday. Includes Stanford faculty lectures on health science, public health, and medicine; group research project to improve health access; professional development workshops; and peer relationships.",
  gradeLevel: [10, 11, 12],
  fields: ["STEM"],
  deadline: "2025-03-17",
  cost: "Free",
  duration: "5 weeks (June 23 - July 25)",
  website: "https://med.stanford.edu/smysp.html"
},
{
  id: 72,
  title: "Stanford Institutes of Medicine Summer Research Program (SIMR)",
  state: "California",
  description: "Eight-week summer program providing abundant firsthand lab experience researching a medically-oriented project. Open to high school juniors and seniors. Aims to increase interest in biological sciences and medicine and deepen understanding of scientific research. Minimum $500 stipend provided.",
  gradeLevel: [11, 12],
  fields: ["STEM"],
  deadline: "2025-02-22",
  cost: "Free with $500+ stipend",
  duration: "8 weeks (June 9 - July 31)",
  website: "https://simr.stanford.edu/"
},
{
  id: 73,
  title: "Meta Summer Academy",
  state: "California",
  description: "Six-week program where externs learn about day-to-day operations of Meta. Build work experience and bolster skills needed for successful tech career. Open to high school students who live in East Palo Alto, Belle Haven, North Fair Oaks, and Redwood City. Minimum 2.0 GPA required.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM"],
  deadline: "2025-02-14",
  cost: "Free (Paid externship)",
  duration: "6 weeks (June 16 - July 25)",
  website: "https://www.metacareers.com/summer-academy/"
},
{
  id: 74,
  title: "StandOut Connect",
  state: "All States",
  description: "Matches high-achieving high school students ages 15-19 with online internships aligned with their interests. Opportunities in finance, STEM, medicine, law, arts, and more. Powered by StandOutSearch (largest free database of high school internships). Featured in Forbes.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM", "Arts", "Leadership", "Social Science"],
  deadline: "2025-12-31", // Various deadlines
  cost: "Free",
  duration: "Summer, spring, fall, or winter",
  website: "https://standoutsearch.com/"
},
{
  id: 75,
  title: "Federal Reserve Bank of Boston TIP Intern Program",
  state: "Massachusetts",
  description: "Today's Interns, Tomorrow's Professionals (TIP) is paid work and learning internship for eligible high school students who completed sophomore year in Boston Public Schools. Starts with summer work experience including job coaching and skill-building workshops. Top performers selected for extended year-round internship up to three years.",
  gradeLevel: [10, 11, 12],
  fields: ["Leadership"],
  deadline: "2025-12-31", // Rolling
  cost: "Free (Paid internship)",
  duration: "8 weeks summer + possible year-round",
  website: "https://www.bostonfed.org/careers/students-and-recent-graduates/tip.aspx"
},
{
  id: 76,
  title: "Summer Learning Institute (SLI)",
  state: "Massachusetts",
  description: "Workforce development program connecting Boston-area students ages 14-18 with community-based jobs. Franklin Institute of Technology and Roxbury Community College offer dual enrollment courses for college credit. Includes leadership, advocacy, and life skills workshops and civic engagement projects.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Leadership"],
  deadline: "2025-05-13",
  cost: "Free (Paid + college credit)",
  duration: "Summer",
  website: "https://www.boston.gov/departments/youth-engagement-and-employment/summer-learning-institute"
},
{
  id: 77,
  title: "NSA High School Work Study Program",
  state: "All States",
  description: "Paid high school internship for juniors interested in business, computer science, and engineering. Interns assist as office assistants and computer aides—helping with administrative tasks and maintenance of data processing equipment. September-August program.",
  gradeLevel: [11],
  fields: ["STEM", "Leadership"],
  deadline: "2025-10-01",
  cost: "Free (Paid internship)",
  duration: "Academic year",
  website: "https://www.intelligencecareers.gov/nsa/nsahsworkstudyprogram.html"
},
{
  id: 78,
  title: "The Emma Bowen Foundation Summer Internship",
  state: "All States",
  description: "Internship for students ages 17-18 interested in producing, journalism, web development, engineering, business, PR, sales, and other media/tech careers. Work with industry-leading partners like Warner Bros., NFL, Paramount, and Time. Can put you on fast track to success in media industry.",
  gradeLevel: [11, 12],
  fields: ["Arts", "STEM", "Leadership"],
  deadline: "2025-01-15", // Early January
  cost: "Free (Paid internship)",
  duration: "Summer",
  website: "https://www.emmabowenfoundation.org/"
},
{
  id: 79,
  title: "BU Summer Challenge",
  state: "Massachusetts",
  description: "Two-week program for rising sophomores, juniors, and seniors to live and learn on Boston University campus. Engage in seminars covering topics including business—discussions, lectures, projects, and field trips while gaining firsthand college life experience.",
  gradeLevel: [9, 10, 11],
  fields: ["Leadership", "STEM"],
  deadline: "2025-12-31", // Rolling
  cost: "Program fee varies",
  duration: "2 weeks (various summer intervals)",
  website: "https://www.bu.edu/summer/high-school-programs/"
},
{
  id: 80,
  title: "Boston Private Industry Council (PIC) Internship",
  state: "Massachusetts",
  description: "Paid internship placing Boston Public School students ages 16-18 with local employers from Fortune 500 companies to startups. Earn income while gaining work experience and professional skills. Positions in business, finance, accounting, HR, and marketing.",
  gradeLevel: [10, 11, 12],
  fields: ["Leadership"],
  deadline: "2025-12-31", // Rolling
  cost: "Free (Paid internship)",
  duration: "6-8 weeks summer",
  website: "https://www.bostonpic.org/internships"
},
{
  id: 81,
  title: "Northeastern Bridge to Calculus (BtC) Summer Program",
  state: "Massachusetts",
  description: "Six-week paid summer program for rising juniors and seniors who are Boston residents. Builds advanced math skills and prepares for college-level coursework. Learn to apply mathematical concepts to financial topics like banking, saving, credit cards, student loans, interest rates, and investing.",
  gradeLevel: [10, 11],
  fields: ["STEM"],
  deadline: "2025-05-31", // Contact for deadline
  cost: "Free (Paid program)",
  duration: "6 weeks summer",
  website: "https://www.northeastern.edu/btc/"
},
{
  id: 82,
  title: "Bentley University Summer Stock Market Challenge",
  state: "Massachusetts",
  description: "Two-week virtual summer program for high school students ages 14-18. Learn about stock market, investing, and financial markets through hands-on challenges and simulations.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Leadership"],
  deadline: "2025-06-19",
  cost: "Free",
  duration: "2 weeks summer",
  website: "https://www.bentley.edu/summer/high-school"
},
{
  id: 83,
  title: "Ladder Internship Program",
  state: "All States",
  description: "Work closely with high-growth startups across tech, AI/ML, health tech, marketing, and consulting. Contribute to real-world projects, develop professional skills like communication and time management. Includes one-on-one skill training, group sessions with fellow interns, and networking with YCombinator-backed founders. Present completed work to company teams.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM", "Leadership"],
  deadline: "2025-12-31", // Multiple cohorts, varies
  cost: "Varies by program type",
  duration: "8 weeks (10-20 hrs/week)",
  website: "https://joinladder.io/"
},
{
  id: 84,
  title: "Young Founders Lab (YFL)",
  state: "All States",
  description: "Build a revenue-generating startup solving real-world problems. 100% virtual with live interactive sessions. Hands-on entrepreneurial work, workshops on business fundamentals, ideation, and skill development. Case studies, panel discussions, and mentorship from entrepreneurs at Google, Microsoft, and other top companies. Founded by Harvard entrepreneurs.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Leadership"],
  deadline: "2025-12-31", // Multiple cohorts: summer, fall, winter, spring
  cost: "Varies (Need-based financial aid available)",
  duration: "Multiple cohorts year-round",
  website: "https://www.youngfounderslab.org/"
},
{
  id: 85,
  title: "Freedom House Summer Learning Institute (SLI)",
  state: "Massachusetts",
  description: "Comprehensive summer program for ages 14-18 enrolled in Boston Public Schools or Boston residents. Community-based job placements with local organizations for work-based learning. Earn college credits through dual enrollment with Franklin Cummings Institute and Roxbury Community College. Leadership, advocacy, and life skills workshops plus civic engagement projects.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Leadership"],
  deadline: "2025-05-30",
  cost: "Free (Paid + college credit)",
  duration: "July 7 - Aug 22 (Orientation July 1)",
  website: "https://www.freedomhouse.com/programs/summer-learning-institute"
},
{
  id: 86,
  title: "Building-U High School Internship",
  state: "All States",
  description: "Year-round virtual internship program for grades 9-12. Join specialized teams tackling real business challenges: Resource R&D, Student Ambassadors, Multi-media, Marketing, Blog Squad, Coding (Laravel, PHP, React), Business Development, Social Media Analytics, and Data Privacy. Work remotely with peers from US, Canada, and beyond.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM", "Arts", "Leadership"],
  deadline: "2025-12-31", // Rolling
  cost: "Free",
  duration: "3+ months (flexible)",
  website: "https://www.building-u.com/internship"
},
{
  id: 87,
  title: "Get Girls Going Summer Incubator",
  state: "Massachusetts",
  description: "Six-week summer incubator for Black female high school students in Boston entering grades 10-12. Work with dedicated mentor and advisor to develop business idea addressing racial and gender inequities. Leadership and changemaking skills through workshops, real-world project development. Continued mentorship throughout school year. Monday-Friday, 9 AM - 3 PM.",
  gradeLevel: [9, 10, 11],
  fields: ["Leadership"],
  deadline: "2025-05-31", // Late spring
  cost: "Free (Mentorship and year-round support)",
  duration: "6 weeks (July 9 - Aug 16)",
  website: "https://www.getgirlsgoing.org/"
},
{
  id: 88,
  title: "Boston PIC Summer Internship Program",
  state: "Massachusetts",
  description: "Connects Boston Public Schools students to paid internships across 200+ private-sector companies (business, finance, tech, healthcare, life sciences, law, architecture) and 60+ community organizations and city agencies. Gain practical skills, earn income, explore career paths. Collaboration between City of Boston, BPS, and PIC ensures comprehensive support.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM", "Leadership", "Arts"],
  deadline: "2025-05-31", // Spring
  cost: "Free (Paid internship)",
  duration: "Early July - Mid August",
  website: "https://www.bostonpic.org/summer-jobs"
},
{
  id: 89,
  title: "Mary Miller Summer Program",
  state: "All States",
  description: "Paid internship honoring legacy of community leader Mary Miller. Rising juniors or seniors develop leadership skills through collaboration with PHC Group senior leadership. Work on social media projects, online community engagement, and technical support. Includes social marketing research, social media strategy, monitoring online interactions, performance reporting. Virtual/Remote.",
  gradeLevel: [10, 11],
  fields: ["Leadership"],
  deadline: "2025-05-31", // Spring
  cost: "Free (Paid internship)",
  duration: "Summer",
  website: "https://phcgroup.com/mary-miller-program"
},
{
  id: 90,
  title: "Veritas AI Program",
  state: "All States",
  description: "Virtual program providing pathway to explore artificial intelligence. Founded by Harvard graduate students. AI Scholars: 10-session course introducing data science, machine learning, and real-world AI applications with mentorship. AI Fellowship: one-on-one with university mentor for original project with optional publication support. Multiple 12-15 week cohorts throughout year.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM"],
  deadline: "2025-12-31", // Rolling: Spring (Jan), Summer (May), Fall (Sep), Winter (Nov)
  cost: "Full financial aid available",
  duration: "12-15 weeks",
  website: "https://www.veritasai.com/"
},
{
  id: 91,
  title: "√Mathroots @ MIT",
  state: "Massachusetts",
  description: "Two-week residential program at MIT for high school students ages 14-18 with strong mathematical ability. Interactive classes, group problem-solving, and lectures from experienced mathematicians. Topics beyond standard curriculum, developing proof-based reasoning and elegant mathematical ideas. Blends competition mathematics with exploratory theoretical work.",
  gradeLevel: [9, 10, 11],
  fields: ["STEM"],
  deadline: "2025-03-03",
  cost: "Free",
  duration: "2 weeks (July 1-15)",
  website: "https://mathroots.mit.edu/"
},
{
  id: 92,
  title: "MITES Summer",
  state: "Massachusetts",
  description: "Six-week residential program at MIT for rising high school seniors (juniors when applying). Five advanced courses in math, science, and humanities. Blends classroom learning, lab tours, and interactions with MIT faculty/students/alumni. College preparation workshops on admissions, financial aid, academic skills. Boston group outings. Seminars connecting STEM to real-world applications.",
  gradeLevel: [11],
  fields: ["STEM", "Humanities"],
  deadline: "2025-02-01",
  cost: "Free",
  duration: "6 weeks summer",
  website: "https://mites.mit.edu/discover-mites/mites-summer/"
},
{
  id: 93,
  title: "Kode With Klossy",
  state: "All States",
  description: "Two-week virtual summer coding camps at no cost for girls and gender-expansive teens ages 13-18. Choose from web development, mobile app creation, data science, or machine learning. Learn HTML, CSS, JavaScript, Python, or Swift. Topics include accessibility, algorithm bias, UX design. Complete final project (website, app, chatbot, or data visualization).",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM"],
  deadline: "2025-03-31",
  cost: "Free",
  duration: "2 weeks (multiple sessions June-August)",
  website: "https://www.kodewithklossy.com/"
},
{
  id: 94,
  title: "Girls Who Code Pathways Program",
  state: "All States",
  description: "Six-week virtual program for 9th-12th grade girls and non-binary students. Self-paced learning through web development, data science, cybersecurity, and artificial intelligence. Connect with peers, hear from tech professionals. Learn Python, HTML, CSS, and JavaScript. More flexible than Summer Immersion Program.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["STEM"],
  deadline: "2025-04-11",
  cost: "Free",
  duration: "6 weeks (June 30 - August 8)",
  website: "https://girlswhocode.com/programs/summer-immersion-program"
},
{
  id: 95,
  title: "Mass General Hospital Youth Neurology Research Program",
  state: "Massachusetts",
  description: "Full-time 6-8 week summer internship for rising seniors and recent graduates living/studying in Massachusetts with U.S. work authorization. 'Bootcamp' covering lab skills, research protocols, professional conduct. Paired with faculty mentor in MGH Neurology lab. Weekly seminars, field trips, networking. Conclude with research presentation. Alumni network provides continued career guidance.",
  gradeLevel: [12],
  fields: ["STEM"],
  deadline: "2025-01-31", // November 1 - January 31
  cost: "Free",
  duration: "6-8 weeks (June 30 - August 8)",
  website: "https://www.massgeneral.org/children/youth-programs/neurology"
},
{
  id: 96,
  title: "Lumiere Breakthrough Scholar Program",
  state: "All States",
  description: "Virtual program for high school seniors globally who demonstrated exceptional achievement despite financial hardships. Work one-on-one with PhD mentor over 12 weeks to develop independent research project in any field (STEM, social sciences, humanities). Nine mentoring sessions, two writing coach meetings, research methodology workshops. Culminates in 15-page paper presented at Lumiere Research Symposium.",
  gradeLevel: [12],
  fields: ["STEM", "Humanities", "Social Science"],
  deadline: "2025-12-31", // Varies by cohort
  cost: "Free",
  duration: "12 weeks (Spring, Summer, Fall, Winter sessions)",
  website: "https://www.lumiere-education.com/breakthrough-scholars"
},
{
  id: 97,
  title: "UMass Chan High School Health Careers Program (HSHCP)",
  state: "Massachusetts",
  description: "Four-week residential experience for Massachusetts sophomores/juniors from underrepresented backgrounds. Classes in science, math, English, technology. Seminars on health issues and cultural perspectives. Field trips and internships with physicians, scientists, healthcare professionals. Health Disparities Research Project investigating healthcare issues. Certificate of Achievement and stipend upon completion.",
  gradeLevel: [10, 11],
  fields: ["STEM"],
  deadline: "2025-03-03",
  cost: "Free with stipend",
  duration: "4 weeks (June 29 - July 25)",
  website: "https://www.umassmed.edu/diversity/pipeline-programs/hshcp/"
},
{
  id: 98,
  title: "American Psychological Association Remote Internship",
  state: "All States",
  description: "Year-round remote internship contributing to projects in research, communications, public policy, or education. Tasks include analyzing data, preparing educational materials, assisting with studies. Supervisor oversees daily tasks. Optional workshops and discussion groups on psychology careers. May be paid or for academic credit.",
  gradeLevel: [9, 10, 11, 12],
  fields: ["Social Science"],
  deadline: "2025-12-31", // Rolling
  cost: "Free (Some paid positions or academic credit)",
  duration: "Year-round",
  website: "https://www.apa.org/careers/interns"
} 
  ]

  // Filter programs based on all selections
const getFilteredPrograms = () => {
  return programs.filter(program => {
    // Filter by state
    const matchesState = !selectedState || 
                        program.state === selectedState || 
                        program.state === "All States"
    
    // Filter by field
    const matchesField = selectedField === "All" || 
                        program.fields.includes(selectedField)
    
    // Filter by grade level
    const matchesGrade = selectedGrade === "All" || 
                        program.gradeLevel.includes(parseInt(selectedGrade))
    
    // Filter by search term
    const matchesSearch = searchTerm === "" ||
                         program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesState && matchesField && matchesGrade && matchesSearch
  })
}

const filteredPrograms = getFilteredPrograms()
console.log("Current selectedState:", selectedState)
  console.log("Filtered programs count:", filteredPrograms.length)


  return (
    <div className="min-h-screen bg-white">
     {/* Navbar */}
<nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-8 py-4 shadow-sm">
  <div className="max-w-7xl mx-auto flex justify-between items-center">
    <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
      Spark
    </Link>
    <div className="flex gap-6 items-center">
      <Link href="/opportunities" className="text-blue-600 hover:text-blue-700 transition font-medium">
        Explore Opportunities
      </Link>
      <div className="h-6 w-px bg-gray-300"></div>
      {user && (
        <>
          <Link href="/bookmarks" className="text-gray-700 hover:text-blue-600 transition font-medium">
            My Bookmarks
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
        </>
      )}
      
      <Link href="/submit" className="text-gray-700 hover:text-blue-600 transition font-medium">Submit Program</Link>
<div className="h-6 w-px bg-gray-300"></div>

      <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition font-medium">Contact</Link>
      <div className="h-6 w-px bg-gray-300"></div>

      <NotificationBell user={user} bookmarkedPrograms={bookmarkedPrograms} />


      {user ? (
        <div className="flex gap-4 items-center">
          <span className="text-gray-700 font-medium">{user.email.split('@')[0]}</span>
          <button 
  onClick={() => setIsLogoutOpen(true)}
  className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition-all font-medium"
>
  Log Out
</button>
        </div>
      ) : (
        <button 
          onClick={() => setIsAuthOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
        >
          Sign In
        </button>
      )}
    </div>
  </div>
</nav>

   {/* Hero Section */}
<div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800">
  <div className="absolute inset-0 bg-black opacity-10"></div>
  <div className="relative max-w-7xl mx-auto px-8 py-24 text-center">
    <h2 className="text-6xl font-bold text-white mb-6">
      Spark Your Future
    </h2>
    <p className="text-2xl text-blue-50 mb-10 max-w-3xl mx-auto">
      Discover thousands of academic programs, leadership opportunities, and competitions designed for high school students across all 50 states.
    </p>
    <div className="flex gap-4 justify-center flex-wrap">
      <Link 
        href="/opportunities" 
        className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
      >
        Explore Opportunities →
      </Link>
      {user ? (
        <Link
          href="/bookmarks"
          className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all inline-block"
        >
          My Bookmarks
        </Link>
      ) : (
        <button 
          onClick={() => setIsAuthOpen(true)}
          className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all"
        >
          Sign Up Free
        </button>
      )}
    </div>
  </div>
</div>

{/* Features Section */}
<div className="max-w-7xl mx-auto px-8 py-20 bg-gradient-to-b from-gray-50 to-white">
  <div className="text-center mb-16">
    <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
    <p className="text-xl text-gray-600">Powerful tools to find and track opportunities that match your goals</p>
  </div>
  
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
    <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Search</h3>
      <p className="text-gray-600 leading-relaxed">
        Search through thousands of programs with our powerful search engine. Find exactly what you're looking for in seconds.
      </p>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Filters</h3>
      <p className="text-gray-600 leading-relaxed">
        Filter by grade level, field of interest, location, deadline, and more to find programs tailored to your needs.
      </p>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">Save & Track</h3>
      <p className="text-gray-600 leading-relaxed">
        Bookmark programs you're interested in and track application deadlines all in one place.
      </p>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">All 50 States</h3>
      <p className="text-gray-600 leading-relaxed">
        Browse opportunities from every state in the US. Find local programs or explore opportunities nationwide.
      </p>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">Deadline Tracking</h3>
      <p className="text-gray-600 leading-relaxed">
        Never miss an application deadline. See upcoming deadlines at a glance and get organized.
      </p>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">Diverse Categories</h3>
      <p className="text-gray-600 leading-relaxed">
        From STEM programs to leadership camps, competitions to research opportunities - find it all here.
      </p>
    </div>
  </div>
</div>
<AuthPopup 
  isOpen={isAuthOpen} 
  onClose={() => setIsAuthOpen(false)}
  showToast={showToast}
/>

<LogoutConfirmPopup
  isOpen={isLogoutOpen}
  onConfirm={handleLogout}
  onCancel={() => setIsLogoutOpen(false)}
/>
<Toast 
  message={toast.message}
  isVisible={toast.show}
  onClose={() => setToast({ show: false, message: '', type: 'success' })}
  type={toast.type}
/>
    </div>
  )
}