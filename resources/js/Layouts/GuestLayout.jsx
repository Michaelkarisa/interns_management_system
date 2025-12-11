import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen w-full flex">
            {/* LEFT IMAGE */}
      <div
    className="hidden md:block w-1/2 bg-center bg-no-repeat bg-gray-100"
    style={{
        backgroundImage: "url('/interns.png')",
        backgroundSize: "contain",
    }}
></div>



            {/* RIGHT FORM */}
            <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-50 p-4">
                <div className="w-full max-w-md ">
                    <div className="flex justify-center mb-3">
                        <Link href="/">
                            <ApplicationLogo size={30}/>
                        </Link>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
