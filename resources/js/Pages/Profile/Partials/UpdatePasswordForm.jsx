// resources/js/Pages/Profile/Partials/UpdatePasswordForm.jsx
import { useForm } from '@inertiajs/react';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const confirmPasswordInput = useRef();
    const currentPasswordInput = useRef();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordColor, setPasswordColor] = useState('bg-red-500');
    const [passwordText, setPasswordText] = useState('Very Weak');

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        const strength = calculatePasswordStrength(data.password);
        setPasswordStrength(strength);

        switch (strength) {
            case 0:
            case 1:
                setPasswordColor('bg-red-500');
                setPasswordText('Very Weak');
                break;
            case 2:
                setPasswordColor('bg-orange-500');
                setPasswordText('Weak');
                break;
            case 3:
                setPasswordColor('bg-blue-500');
                setPasswordText('Medium');
                break;
            case 4:
                setPasswordColor('bg-green-500');
                setPasswordText('Strong');
                break;
            default:
                setPasswordColor('bg-red-500');
                setPasswordText('Very Weak');
        }
    }, [data.password]);

    function calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}
        >
            <header>
                <h2 className="text-lg font-semibold text-gray-900">Update Password</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-5">
                {/* CURRENT PASSWORD */}
                <div>
                    <InputLabel htmlFor="current_password" value="Current Password" />
                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="mt-2 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        autoComplete="current-password"
                    />
                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                {/* NEW PASSWORD */}
                <div className="relative">
                    <InputLabel htmlFor="password" value="New Password" />
                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        className="mt-2 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg pr-10"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <InputError message={errors.password} className="mt-2" />

                    {/* PASSWORD STRENGTH METER */}
                    <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Password Strength</p>
                        <div className="mt-1 h-2 w-full bg-gray-300 rounded">
                            <div
                                className={`${passwordColor} h-2 rounded`}
                                style={{ width: `${(passwordStrength / 4) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-sm mt-1 text-gray-700">{passwordText}</p>
                    </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="relative">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                        id="password_confirmation"
                        ref={confirmPasswordInput}
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="mt-2 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg pr-10"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* FOOTER BUTTON */}
                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing} className="px-5 py-2 rounded-lg">
                        Save
                    </PrimaryButton>

                    <AnimatePresence>
                        {recentlySuccessful && (
                            <motion.p
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-sm font-medium text-green-600"
                            >
                                Saved!
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </form>
        </motion.section>
    );
}
