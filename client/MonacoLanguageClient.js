<template>
  <div id="container" style="height: 100%;"></div>
</template>
<script>
import { listen } from 'vscode-ws-jsonrpc'
import { MonacoLanguageClient, MonacoServices, CloseAction, ErrorAction, createConnection } from 'monaco-languageclient'
import { debounce } from 'lodash'
import * as monaco from 'monaco-editor'

const monacoServerURL = ""

self.MonacoEnvironment = {
  getWorkerUrl: function () { return '/editor.worker.bundle.js' }
}

export default {
  props: {
    width: {type: [String, Number], default: '100%'},
    height: {type: [String, Number], default: '100%'},
    value: String,
    language: String,
    theme: String,
    filename: String,
    options: { type: Object },
    changeThrottle: Number
  },
  data () {
    return {
      url: monacoServerURL
    }
  },
  computed: {

  },
  mounted () {
    this.monaco = monaco
    this.initMonaco(monaco)
  },
  beforeDestroy () {
    this.editor && this.editor.dispose()
  },
  methods: {
    initMonaco (monaco) {
      const { value, theme, language, options } = this
      const editorOptions = {
        value: value,
        theme: theme,
        language: language,
        ...options
      }
      monaco.languages.register({
        id: 'python',
        extensions: ['.py'],
        aliases: ['python'],
        mimetypes: ['application/text']
      })
      this.editor = monaco.editor.create(this.$el, editorOptions)
      this.editorHasLoaded(this.editor, monaco)
      MonacoServices.install(this.editor)
      this.connectToMonacoServer()
    },
    connectToMonacoServer () {
      const webSocket = new WebSocket(this.url)
      listen({
        webSocket: webSocket,
        onConnection: (connection) => {
          var languageClient = this.createLanguageClient(connection)
          var disposable = languageClient.start()
          connection.onClose(function () { return disposable.dispose() })
          connection.onError(function (error) { console.log(error) })
        }
      })
    },
    createLanguageClient (connection) {
      return new MonacoLanguageClient({
        name: 'Monaco language client',
        clientOptions: {
          documentSelector: ['python'],
          errorHandler: {
            error: () => ErrorAction.Continue,
            closed: () => CloseAction.DoNotRestart
          }
        },
        connectionProvider: {
          get: (errorHandler, closeHandler) => {
            return Promise.resolve(createConnection(connection, errorHandler, closeHandler))
          }
        }
      })
    },
    editorHasLoaded (editor, monaco) {
      this.editor = editor
      this.monaco = monaco
      this.editor.onDidChangeModelContent(event => this.codeChangeHandler(editor, event))
      this.$emit('mounted', editor)
    },
    codeChangeHandler (editor) {
      if (this.codeChangeEmitter) {
        this.codeChangeEmitter(editor)
      } else {
        this.codeChangeEmitter = debounce(function (editor) { this.$emit('codeChange', editor) }, this.changeThrottle)
        this.codeChangeEmitter(editor)
      }
    },
    style () {
      let { width, height } = this
      let fixedWidth = width.toString().indexOf('%') !== -1 ? width : `${width}px`
      let fixedHeight = height.toString().indexOf('%') !== -1 ? height : `${height}px`
      if (this.editor) {
        this.editor.layout({
          width: fixedWidth.replace('px', ''),
          height: fixedHeight.replace('px', '')
        })
      }
      return {
        width: fixedWidth,
        height: fixedHeight
      }
    }
  }
}
</script>
