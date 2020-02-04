import React from 'react';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../components';

const NotifContent = ({ title, text, light }) => (
    <div>
        <p className="lead">{ title }</p>
        <p className={light ? 'text-light' : 'text-muted'}><small>{ text }</small></p>
    </div>
);

class LoadingToastController {
    constructor() {
        this._toast = toast(<LoadingSpinner />, { autoClose: false, closeOnClick: false, closeButton: false });
    }

    success(title, content) {
        toast.update(this._toast, {
            type: toast.TYPE.DEFAULT,
            render: <NotifContent title={title} text={content} />,
            autoClose: 4000,
            closeButton: null,
            closeOnClick: true,
        });
    }

    error(title, content) {
        console.trace(title, content);
        toast.update(this._toast, {
            render: <NotifContent title={title} text={content} light />,
            type: toast.TYPE.ERROR,
            closeButton: null,
            closeOnClick: true,
        });
    }

    dismiss() {
        toast.dismiss(this._toast);
    }
}

export default LoadingToastController;
