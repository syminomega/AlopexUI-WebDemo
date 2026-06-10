import { dotnet } from './_framework/dotnet.js';
import { createBrowserApplicationImports } from './_content/AlopexApplication.WebAssembly/alopex-application-webassembly.js';
import { createBrowserVelloImports } from './_content/AlopexCanvas.Vello.WebAssembly/alopex-vello-webassembly.js';

const runtime = await dotnet.create();
const { setModuleImports, getAssemblyExports } = runtime;

const exportsRef = await getAssemblyExports('AlopexApplication.WebAssembly');
const applicationExports = exportsRef?.AlopexApplication?.WebAssembly?.BrowserWebApplicationHost;

if (!applicationExports) {
    throw new Error('AlopexApplication.WebAssembly.BrowserWebApplicationHost exports were not found.');
}

setModuleImports('alopex-application.js', {
    alopexApplication: createBrowserApplicationImports('alopex-desktop', () => applicationExports),
});

setModuleImports('alopex-vello.js', {
    alopexVello: createBrowserVelloImports(),
});

await runtime.runMain();
