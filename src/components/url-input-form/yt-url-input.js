import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getPlaylistID, getYoutubeVideoID } from '../../utils';

const YtUrlInput = ({ loading, onStateChanged }) => {
    const [value, setValue] = useState('');
    const playlistId = useMemo(() => getPlaylistID(value), [value]);
    const videoId = useMemo(() => getYoutubeVideoID(value), [value]);
    const isUrlInvalid = useMemo(() => !playlistId && !videoId, [playlistId, videoId]);

    const onInputChange = useCallback((e) => {
        setValue(e.target.value);
    }, []);

    useEffect(() => {
        if(onStateChanged) {
            onStateChanged({ isUrlInvalid, playlistId, videoId });
        }
    }, [isUrlInvalid, playlistId, videoId, onStateChanged]);

    useEffect(() => {
        if(!loading) {
            setValue('');
        }
    }, [loading]);

    return (
        <div className="input-group" id="input">
            <input
                type="text"
                id="videoURL"
                name="videoURL"
                className={`form-control ${isUrlInvalid && value.length > 0 ? 'is-invalid' : ''}`}
                value={value}
                onChange={onInputChange}
                placeholder="insert here your youtube video url..."
                disabled={loading} />
        </div>
    );
};

YtUrlInput.propTypes = {
    loading: PropTypes.bool,
    onStateChanged: PropTypes.func,
};

YtUrlInput.defaultProps = {
    loading: false,
    onStateChanged: null,
};

export default YtUrlInput;
