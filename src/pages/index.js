import React, { Component } from 'react'
import Link from 'gatsby-link'
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, convertToRaw, convertFromRaw, SelectionState } from 'draft-js';
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
    this.state = { editorState: EditorState.createEmpty(), text: '', };
    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => {
      this.setState({ editorState }, () => {
        this.notifyPusher(stateToHTML(this.state.editorState.getCurrentContent()));
        this.notifyPusherEditor(this.state.editorState)
      })
    };
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    this.getBlockStyle = this._getBlockStyle.bind(this);
    this.notifyPusher = this._notifyPusher.bind(this);
    this.notifyPusherEditor = this._notifyPusherEditor.bind(this);
  }

  componentWillMount() {
    this.pusher = new Pusher('YOUR PUSHER KEY', {
      cluster: 'eu',
      encrypted: true
    });

    this.channel = this.pusher.subscribe('editor');
  }

  componentDidMount() {
    let self = this;
    this.channel.bind('text-update', function (data) {
      self.setState({ text: data.text })
    });

    this.channel.bind('editor-update', function (data) {
      let newSelection = new SelectionState({
        anchorKey: data.selection.anchorKey,
        anchorOffset: data.selection.anchorOffset,
        focusKey: data.selection.focusKey,
        focusOffset: data.selection.focusOffset,
      });
      let editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(data.text)))
      const newEditorState = EditorState.forceSelection(
        editorState,
        newSelection
      );
      self.setState({ editorState: newEditorState })
    });
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

  _notifyPusher(text) {
    axios.post('http://localhost:5000/save-text', { text })
  }

  _notifyPusherEditor(text) {
    const selection = this.state.editorState.getSelection()
    let rawText = convertToRaw(text.getCurrentContent())
    axios.post('http://localhost:5000/editor-text', { text: JSON.stringify(rawText), selection })
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
            <div dangerouslySetInnerHTML={{ __html: this.state.text }} />
          </div>
        </div>
      </div>
    );
  }
}

export default IndexPage
