import { useNavigate } from "react-router-dom";

export default function Success() {
    const navigate = useNavigate();

    const handleReturn = () => {
        navigate("/dashboard", { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFD]">
            <div className="relative max-w-md w-full space-y-8 p-12 bg-white rounded-[20px] shadow-sm hover:shadow-lg transition-shadow">
                <div className="absolute inset-x-0 -top-24 -bottom-24 bg-gradient-to-b from-[#FBFBFD] via-white to-[#FBFBFD] opacity-80 blur-3xl -z-10" />
                <div className="text-center">
                    <h1 className="text-4xl font-semibold text-[#1D1D1F] mb-4">Success! 🎉</h1>
                    <p className="text-xl text-[#86868B] mb-10">Your payment has been processed successfully.</p>
                    <button
                        onClick={handleReturn}
                        className="w-full flex justify-center py-3 px-6 rounded-full text-sm font-medium text-white bg-[#0066CC] hover:bg-[#0077ED] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:ring-offset-2"
                    >
                        Return Back
                    </button>
                </div>
            </div>
        </div>
    );
}

// ?customer_session_token=polar_cst_t33RWpZJ1CzVSJkq7eJ5bDuG36OJRX11HpCD93zVZ5n