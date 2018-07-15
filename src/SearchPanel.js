import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-spring';
import { searchVideos } from './api.js';
import './styles/SearchPanel/SearchPanel.css';


const Pagination = ({ page, totalPages, prevPage, nextPage }) => (
    <div className="btn-group search-panel-pagination" role="group" aria-label="Pagination">
        <button type="button" className="btn btn-secondary btn-sm" disabled={ page === 0 } onClick={ prevPage }>
            <i className="material-icons">chevron_left</i>
        </button>
        <button type="button" className="btn btn-secondary btn-sm" disabled={ true }>
            { page + 1 }
        </button>
        <button type="button" className="btn btn-secondary btn-sm" disabled={ page === totalPages - 1 } onClick={ nextPage }>
            <i className="material-icons">chevron_right</i>
        </button>
    </div>
);


export default class SearchPanel extends Component {

    static propTypes = {
        showing: PropTypes.bool.isRequired,
        onPlayClicked: PropTypes.func.isRequired,
        onEnqueueClicked: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            text: "",
            loading: false,
            results: [],
            page: 0,
        };

        this.searchFieldDoSearch = this.searchFieldDoSearch.bind(this);
        this.searchFieldChanged = this.searchFieldChanged.bind(this);
        this.prevPage = this.prevPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
    }

    render() {
        const { showing, onPlayClicked, onEnqueueClicked } = this.props;
        const { text, loading, results, page } = this.state;
        let element = [];
        if (showing) {
            element.push(styles => <div id="searchPanel" style={styles}>
                <div className="mt-4 ml-4 mr-4">
                    <div className="form-group">
                        <label htmlFor="search-input">Search for videos</label>
                        <input id="search-input" className="form-control" placeholder="Search"
                            disabled={ loading }
                            value={ text }
                            onKeyUp={ this.searchFieldDoSearch }
                            onChange={ this.searchFieldChanged } />
                    </div>
                    <div className="container">
                        { results.length > 0 ? (
                            <Pagination page={ page } nextPage={ this.nextPage } prevPage={ this.prevPage } totalPages={ this._search.totalPages - 1 } />
                        ) : null }
                        { results.length > 0 ? results[page].map((item, i) => (
                            <div key={i} className="row mb-1 result">
                                <div className="col-auto">
                                    { item.snippet.thumbnails &&
                                        <img src={(item.snippet.thumbnails.medium || item.snippet.thumbnails.default).url} width={ 128 } onClick={ () => onPlayClicked(item) } />
                                    }
                                </div>
                                <div className="col row">
                                    <div className="col-12 align-self-start">
                                        <small>{ item.snippet.title }</small>
                                    </div>
                                    <div className="col-12 align-self-end">
                                        <a href="#" onClick={ e => { e.preventDefault(); onPlayClicked(item) } }>
                                            <i className="material-icons">play_circle_outline</i>
                                        </a>
                                        <a href="#" onClick={ e => { e.preventDefault(); onEnqueueClicked(item) } }>
                                            <i className="material-icons">playlist_add</i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )) : null }
                        { results.length > 0 ? (
                            <Pagination page={ page } nextPage={ this.nextPage } prevPage={ this.prevPage } totalPages={ this._search.totalPages - 1 } />
                        ) : null }
                    </div>
                </div>
            </div>);
        }

        return (
            <Transition
                keys={element.map(() => 'queue')}
                from={{ right: SearchPanel._right }}
                enter={{ right: 0 }}
                leave={{ right: SearchPanel._right }}>
                    { element }
            </Transition>
        );
    }

    searchFieldChanged(event) {
        event.preventDefault();
        this.setState({ text: event.target.value });
    }

    async searchFieldDoSearch(event) {
        if(event.keyCode === 13) {
            event.preventDefault();
            this.setState({ loading: true, page: 0, results: [] });
            this._search = searchVideos(this.state.text);
            this.setState({ loading: false, results: [ await this._search.getNextPage() ] });
        }
    }

    prevPage(event) {
        event.preventDefault();
        this.setState({ page: Math.max(this.state.page - 1, 0) });
    }

    async nextPage(event) {
        event.preventDefault();
        if(this.state.page + 1 === this._search.loadedPages) {
            this.setState({ loading: true });
            this.setState({ loading: false, results: [ ...this.state.results, await this._search.getNextPage() ], page: this.state.page + 1 });
        } else {
            this.setState({ page: Math.min(this.state.page + 1, this._search.totalPages - 1) });
        }
    }

    static get _right() {
        const windowWidth = window.document.body.clientWidth;
        if(windowWidth < 576) {
            return -windowWidth * 0.90;
        } else if(windowWidth < 768) {
            return -288;
        } else if(windowWidth < 1200) {
            return -384;
        } else {
            return -400;
        }
    }
}
