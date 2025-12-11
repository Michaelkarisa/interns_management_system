// resources/js/Pages/Profile/Partials/DeleteUserForm.jsx
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const confirmUserDeletion = () => setConfirmingUserDeletion(true);

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}
        >
            <header>
                <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data will be permanently deleted.
                </p>
            </header>

            <div className="mt-4">
                <DangerButton
                    onClick={confirmUserDeletion}
                    className="px-4 py-2 text-sm rounded-lg"
                >
                    Delete Account
                </DangerButton>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {confirmingUserDeletion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
                        >
                            <h2 className="text-lg font-semibold text-gray-900">
                                Are you sure?
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Please enter your password to confirm deletion.
                            </p>

                            <form onSubmit={deleteUser} className="mt-5 space-y-4">
                                <div>
                                    <InputLabel htmlFor="password" value="Password" className="sr-only" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg"
                                        placeholder="Password"
                                        autoFocus
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <SecondaryButton
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm rounded-lg"
                                    >
                                        Cancel
                                    </SecondaryButton>
                                    <DangerButton
                                        type="submit"
                                        className="px-4 py-2 text-sm rounded-lg"
                                        disabled={processing}
                                    >
                                        Delete Account
                                    </DangerButton>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
}