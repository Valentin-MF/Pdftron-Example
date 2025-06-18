import { Component, OnInit } from '@angular/core';
import { documentUrl, pdftronLicense, pdftronPath, pdftronUrl, userName } from '../constants';
import WebViewer, { Core, WebViewerInstance } from "@pdftron/webviewer";

const customDownloadHeaderButtonElement = "headerDownloadButton";
const customPrintButtonElement = "headerPrintButton";


@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App implements OnInit {

    private webViewerInstance: WebViewerInstance;

    public ngOnInit(): void {
        try {
            let hostElement = document.getElementById("webviewer-container");

            WebViewer.Iframe({
                licenseKey: pdftronLicense,
                webviewerServerURL: pdftronUrl,
                path: pdftronPath,
                backendType: "xod",
                enableMeasurement: true,
            }, hostElement).then((instance) => {
                this.webViewerInstance = instance;

                this.webViewerInstance.Core.disableEmbeddedJavaScript();
                this.webViewerInstance.Core.annotationManager.setCurrentUser(userName);
                this.webViewerInstance.UI.disableElements(["fileAttachmentToolButton", "cropToolButton"]);

                // Reworking header:
                this.initWebViewerHeader();

                // Error handling
                this.webViewerInstance.UI.addEventListener("loaderror", (err) => {
                    this.webViewerInstance.UI.displayErrorMessage("Error with Pdftron when document load.");
                    console.error(err);
                });

                this.webViewerInstance.Core.documentViewer.addEventListener("documentLoaded", () => {
                    this.webViewerInstance.UI.setActiveRibbonItem(this.webViewerInstance.UI.ToolbarGroup.VIEW);
                });

                this.viewFile();
            });
        }
        catch (e) {
            console.log(e);
        }
    }

    private initWebViewerHeader(): void {
        const buttons = this.webViewerInstance.UI.PRESET_BUTTON_TYPES;
        this.webViewerInstance.UI.disableElements([buttons.SAVE_AS, buttons.PRINT, buttons.DOWNLOAD, buttons.FULLSCREEN]);

        let topHeader = this.webViewerInstance.UI.getModularHeader("default-top-header");
        let topHeaderItems = topHeader.getItems();

        let print = new this.webViewerInstance.UI.Components.CustomButton({
            title: "Print",
            dataElement: customPrintButtonElement,
            img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:#abb0c4;}</style></defs><title>icon - header - print - line</title><path class="cls-1" d="M20,6H18V2H6V6H4A2,2,0,0,0,2,8v9a2,2,0,0,0,2,2H6v3H18V19h2a2,2,0,0,0,2-2V8A2,2,0,0,0,20,6ZM8,4h8V6H8Zm8,16H8V16h8Zm4-3H18V14H6v3H4V8H20Zm-4-7h2v2H16Zm-3,0h2v2H13Z"></path></svg>',
            onClick: this.print.bind(this)
        });

        let download = new this.webViewerInstance.UI.Components.CustomButton({
            title: "Download",
            dataElement: customDownloadHeaderButtonElement,
            img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:#abb0c4;}</style></defs><title>icon - header - download</title><path class="cls-1" d="M11.55,17,5.09,9.66a.6.6,0,0,1,.45-1H8.67V2.6a.6.6,0,0,1,.6-.6h5.46a.6.6,0,0,1,.6.6V8.67h3.13a.6.6,0,0,1,.45,1L12.45,17A.6.6,0,0,1,11.55,17ZM3.11,20.18V21.6a.4.4,0,0,0,.4.4h17a.4.4,0,0,0,.4-.4V20.18a.4.4,0,0,0-.4-.4h-17A.4.4,0,0,0,3.11,20.18Z"></path></svg>',
            onClick: this.download.bind(this)
        });

        topHeader.setItems([...topHeaderItems, print, download]);

        // Hiding our print & download buttons by default. They will be enabled again when we got the proper rights of the current user.
        this.webViewerInstance.UI.disableElements([customDownloadHeaderButtonElement, customPrintButtonElement]);

        // Also disables the print feature
        this.webViewerInstance.UI.disableFeatures([this.webViewerInstance.UI.Feature.Print]);
    }

    private print(): void {
        //Printing with modifications.
        this.webViewerInstance.UI.print();
    }

    private download(): void {
        //Downloading with modifications.
        this.webViewerInstance.UI.downloadPdf();
    }


    protected viewFile(): void {
        // We call for our right permissions when we're sure that our webViewerInstance is set.
        this.checkPermissionsAsync();

        const options = {
            filename: "01 - January 2018 (myphotopack.com).jpg",
            documentId: "AECC279C-C419-4944-B04B-EC904367BD23",
            cacheKey: "4311D348-29E4-44F1-A511-0B8808C5178E",
        };

        this.setWatermark();

        this.loadFile(options);
    }

    protected loadFile(options: { filename: string; documentId: string; cacheKey: string; }): void {
        this.webViewerInstance.UI.loadDocument(documentUrl, options as any);
    }

    private checkPermissionsAsync(): void {
        // Info: In our real usage we call server to retrives specific user rights

        const canDownload = true;
        if (canDownload)
            this.webViewerInstance.UI.enableElements([customDownloadHeaderButtonElement]);
        else
            this.webViewerInstance.UI.disableElements([customDownloadHeaderButtonElement]);

        const canPrint = true;
        if (canPrint) {
            this.webViewerInstance.UI.enableFeatures([this.webViewerInstance.UI.Feature.Print]);
            this.webViewerInstance.UI.enableElements([customPrintButtonElement]);
        } else {
            this.webViewerInstance.UI.disableFeatures([this.webViewerInstance.UI.Feature.Print]);
            this.webViewerInstance.UI.disableElements([customPrintButtonElement]);
        }
    }

    public setWatermark() {
        this.webViewerInstance.Core.documentViewer.setWatermark({
            diagonal: {
                color: "#000000",
                fontFamily: "Brush Script MT",
                fontSize: 25,
                opacity: 100,
                text: userName
            }
        });
    }
}
