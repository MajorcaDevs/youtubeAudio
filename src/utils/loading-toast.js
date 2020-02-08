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
    constructor(resource = null) {
        console.trace(resource);
        this._toast = toast(<LoadingSpinner resource={resource} />, {
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
            draggable: false,
        });
    }

    success(title, content) {
        toast.update(this._toast, {
            type: toast.TYPE.DEFAULT,
            render: <NotifContent title={title} text={content} />,
            autoClose: 4000,
            closeButton: null,
            closeOnClick: true,
            draggable: true,
        });
    }

    error(title, content) {
        console.trace(title, content);
        toast.update(this._toast, {
            render: <NotifContent title={title} text={content} light />,
            type: toast.TYPE.ERROR,
            closeButton: null,
            closeOnClick: true,
            draggable: true,
        });
    }

    info(title, content) {
        toast.update(this._toast, {
            render: <NotifContent title={title} text={content} />,
            type: toast.TYPE.INFO,
            closeButton: null,
            closeOnClick: true,
            draggable: true,
        });
    }

    dismiss() {
        toast.dismiss(this._toast);
    }
}

window.LoadingToastController = LoadingToastController;

export default LoadingToastController;
