import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';

import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ForceChangePassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.force.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Change Password" />

            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Change Your Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        You must set a new password to continue using your account.
                    </p>
                </div>

                <form onSubmit={submit} className="w-full max-w-md space-y-5">
                    {/* New Password */}
                    <div className="relative">
                        <InputLabel htmlFor="password" value="New Password" className="text-gray-700" />
                        <div className="mt-1 relative">
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                className="w-full pr-10"
                                autoComplete="new-password"
                                isFocused
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-gray-700" />
                        <div className="mt-1 relative">
                            <TextInput
                                id="password_confirmation"
                                type={showConfirm ? 'text' : 'password'}
                                value={data.password_confirmation}
                                className="w-full pr-10"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'}
                                onClick={() => setShowConfirm(!showConfirm)}
                            >
                                {showConfirm ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>

                    <div className="pt-2">
                        <PrimaryButton
                            className="w-full py-3 text-base font-medium flex justify-center items-center"
                            disabled={processing}
                        >
                            {processing ? 'Updating Password...' : 'Update Password'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}