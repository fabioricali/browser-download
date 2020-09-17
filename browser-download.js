class BrowserDownload {
    constructor(opts) {
        this.opts = opts;
        this.isRunning = false;
    }

    async run(files) {
        try {
            this.isRunning = true;
            if (typeof this.opts.onStart === 'function')
                this.opts.onStart(this);
            if (files.length > 1) {
                let zip = new JSZip();
                for (let i = 0; i < files.length; i++) {
                    if (typeof this.opts.onDownloadFileStart === 'function')
                        this.opts.onDownloadFileStart(files[i], files, this);

                    let response = await fetch(files[i].url);
                    let blob = await response.blob();
                    zip.file(files[i].name, blob);

                    if (typeof this.opts.onDownloadFileEnd === 'function')
                        this.opts.onDownloadFileEnd(files[i], files, this);
                }

                if (typeof this.opts.onZipStart === 'function')
                    this.opts.onZipStart(this);

                let time = new Date().toISOString().replace(/[.:T\-Z]/g, '');
                let zipContent = await zip.generateAsync({type: 'blob'});
                saveAs(zipContent, `files-${time}.zip`);

                if (typeof this.opts.onZipEnd === 'function')
                    this.opts.onZipEnd(this);
            } else {
                if (typeof this.opts.onDownloadFileStart === 'function')
                    this.opts.onDownloadFileStart(files[0], this);

                saveAs(files[0].url, files[0].name);

                if (typeof this.opts.onDownloadFileEnd === 'function')
                    this.opts.onDownloadFileEnd(files[0], this);
            }
            if (typeof this.opts.onEnd === 'function')
                this.opts.onEnd(null, this);
        } catch (e) {
            if (typeof this.opts.onEnd === 'function')
                this.opts.onEnd(e, this);
        } finally {
            this.isRunning = false;
        }
    }
}