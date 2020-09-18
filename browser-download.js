class BrowserDownload {
    constructor(opts) {
        this.opts = opts;
        this.isRunning = false;
    }

    async run(files) {
        try {
            this.isRunning = true;
            let totalFilesComplete = 0;
            if (typeof this.opts.onStart === 'function')
                this.opts.onStart(this);
            if (files.length > 1) {
                let zip = new JSZip();
                for (let i = 0; i < files.length; i++) {
                    if (typeof this.opts.onDownloadFileStart === 'function')
                        this.opts.onDownloadFileStart(files[i], files, totalFilesComplete, this);

                    try {
                        let response = await fetch(files[i].url);
                        let blob = await response.blob();
                        zip.file(files[i].name, blob);
                    } catch (e) {
                        if (typeof this.opts.onDownloadFileError === 'function')
                            this.opts.onDownloadFileError(e, files[i], files, totalFilesComplete, this);
                    }

                    totalFilesComplete++;
                    if (typeof this.opts.onDownloadFileEnd === 'function')
                        this.opts.onDownloadFileEnd(files[i], files, totalFilesComplete, this);
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
                    this.opts.onDownloadFileStart(files[0], files, totalFilesComplete, this);

                try {
                    let response = await fetch(files[0].url);
                    let blob = await response.blob();
                    saveAs(blob, files[0].name);
                } catch (e) {
                    if (typeof this.opts.onDownloadFileError === 'function')
                        this.opts.onDownloadFileError(e, files[0], files, totalFilesComplete, this);
                }

                totalFilesComplete++;
                if (typeof this.opts.onDownloadFileEnd === 'function')
                    this.opts.onDownloadFileEnd(files[0], files, totalFilesComplete, this);
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