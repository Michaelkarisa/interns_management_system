import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const goBack = () => {
        window.history.back(); // ← Go back in browser history
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="min-h-screen flex flex-col md:flex-row">
                <div className="flex w-full items-center justify-center p-4">
                    <div className="w-full max-w-md">

                        {/* ✅ Back Button using browser history */}
                        <div className="mb-4">
                            <button
                                type="button"
                                onClick={goBack}
                                className="text-sm text-gray-600 hover:text-gray-900 underline"
                            >
                                ← Back
                            </button>
                        </div>

                        <div className="mb-4 text-sm text-gray-600">
                            Forgot your password? No problem.  
                            Enter your email and we will send you a reset link.
                        </div>

                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-2">
                            <div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="flex justify-end pt-2">
                                <PrimaryButton disabled={processing}>
                                    Email Password Reset Link
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}