import AuthModal from '@/components/AuthModal';
import LoginComponent from '@/components/LoginComponent';
import ResetPasswordComponent from '@/components/ResetPasswordComponent';
import SignUpComponent from '@/components/SignUpComponent';
import React, { createContext, useContext, useState } from 'react';

type ModalContextType = {
    showModal: boolean;
    closeModal: () => void;
    handleLoginModal: () => void;
    handleForgotPwrdModal: () => void;
    handleSignupModal: () => void;
    modalTitle: string;
    modalChildren: React.ReactNode; // Allow for various types of children
};

const ModalContext = createContext<ModalContextType>({
    showModal: false,
    closeModal: () => { },
    handleLoginModal: () => { },
    handleForgotPwrdModal: () => { },
    handleSignupModal: () => { },
    modalTitle: 'Login',
    modalChildren: null,
});

export const useModal = () => {
    return useContext(ModalContext);
};

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {

    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('Login');
    const [modalChildren, setModalChildren] = useState({} as React.ReactNode);

    const closeModal = () => {
        document.body.style.overflowY = 'auto';
        setShowModal(false);
    };

    const handleLoginModal = () => {
        const curr_url = window.location.href;
        setModalTitle("Login");
        setModalChildren(<LoginComponent page='Modal' redirect={curr_url} handleForgotPwrdModal={handleForgotPwrdModal}
            handleSignupModal={handleSignupModal} closeModal={closeModal} />);
        setShowModal(true);
        document.body.style.overflowY = 'hidden';
    };

    const handleForgotPwrdModal = () => {
        setModalTitle("Reset Password");
        setModalChildren(<ResetPasswordComponent page='Modal' handleLoginModal={handleLoginModal} closeModal={() => closeModal} />);
        setShowModal(true);
        document.body.style.overflowY = 'hidden';
    };

    const handleSignupModal = () => {
        const curr_url = window.location.href;
        setModalTitle("Sign Up");
        setModalChildren(<SignUpComponent page='Modal' redirect={curr_url} handleLoginModal={handleLoginModal} closeModal={() => closeModal} />);
        setShowModal(true);
        document.body.style.overflowY = 'hidden';
    };

    return (
        <ModalContext.Provider value={{
            showModal, closeModal, handleLoginModal, handleForgotPwrdModal, handleSignupModal,
            modalTitle, modalChildren
        }}>
            {children}
            <AuthModal show={showModal} children={modalChildren} closeModal={closeModal} title={modalTitle} />
        </ModalContext.Provider>
    );
};
