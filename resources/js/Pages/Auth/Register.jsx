import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordColor, setPasswordColor] = useState('bg-red-500');
    const [passwordText, setPasswordText] = useState('Very Weak');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        const strength = calculatePasswordStrength(data.password);
        setPasswordStrength(strength);

        // Map strength to color and text
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

    // Calculate password strength
    function calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="min-h-screen flex flex-col md:flex-row">
                <div className="flex w-full items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <form onSubmit={submit} className="space-y-4">
                            {/* NAME */}
                            <div>
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* EMAIL */}
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* PASSWORD */}
                            <div className="relative">
                                <InputLabel htmlFor="password" value="Password" />
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full pr-10"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                                <InputError message={errors.password} className="mt-2" />

                                {/* PASSWORD STRENGTH METER */}
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700">
                                        Password Strength
                                    </p>
                                    <div className="mt-1 h-2 w-full bg-gray-300 rounded">
                                        <div
                                            className={`${passwordColor} h-2 rounded`}
                                            style={{
                                                width: `${(passwordStrength / 4) * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-sm mt-1 text-gray-700">{passwordText}</p>
                                </div>
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="relative">
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirm Password"
                                />
                                <TextInput
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full pr-10"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData('password_confirmation', e.target.value)
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>

                            {/* FOOTER */}
                            <div className="flex items-center justify-between pt-2">
                                <Link
                                    href={route('login')}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900"
                                >
                                    Already registered?
                                </Link>
                                <PrimaryButton disabled={processing}>Register</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
