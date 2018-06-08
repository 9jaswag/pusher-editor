import React, { Component } from 'react'
import Link from 'gatsby-link'
import { Editor, EditorState, RichUtils, getDefaultKeyBinding } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import Pusher from 'pusher-js';
import axios from 'axios'
import BlockStyleControls from '../components/blockStyleControls'
import InlineStyleControls from '../components/inlineStylesControls'
import 'bootstrap/dist/css/bootstrap.css'

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

class IndexPage extends Component {
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };
    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => this.setState({ editorState });
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    this.getBlockStyle = this._getBlockStyle.bind(this);
  }

  componentWillMount() {
    // this.pusher = new Pusher('YOUR PUSHER APP ID', {
    //   authEndpoint: 'YOUR AUTH SERVER ENDPOINT',
    //   cluster: 'YOUR APP CLUSTER',
    //   encrypted: true
    // });

    // this.post_channel = this.pusher.subscribe('editor');
  }

  componentDidMount() {
    // this.post_channel.bind('editor', (text) => {
    //   console.log(text)
    //   this.setState({ editorText: text })
    // });
  }

  _getBlockStyle(block) {
    switch (block.getType()) {
      case 'blockquote': return 'RichEditor-blockquote';
      default: return null;
    }
  }

  _handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }
  _mapKeyToEditorCommand(e) {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(
        e,
        this.state.editorState,
        4, /* maxDepth */
      );
      if (newEditorState !== this.state.editorState) {
        this.onChange(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  }
  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }
  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  render() {
    const { editorState } = this.state;
    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="RichEditor-root col-12 col-md-6">
            <BlockStyleControls
              editorState={editorState}
              onToggle={this.toggleBlockType}
            />
            <InlineStyleControls
              editorState={editorState}
              onToggle={this.toggleInlineStyle}
            />
            <div className={className} onClick={this.focus}>
              <Editor
                blockStyleFn={this.getBlockStyle}
                customStyleMap={styleMap}
                editorState={editorState}
                handleKeyCommand={this.handleKeyCommand}
                keyBindingFn={this.mapKeyToEditorCommand}
                onChange={this.onChange}
                placeholder="What's on your mind?"
                ref="editor"
                spellCheck={true}
              />
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div dangerouslySetInnerHTML={{ __html: stateToHTML(this.state.editorState.getCurrentContent()) }} />
          </div>
        </div>
      </div>
    );
  }
}

export default IndexPage
