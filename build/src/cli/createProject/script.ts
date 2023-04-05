import path from 'node:path';

export const createProject = (args: Record<string, string | boolean>) => {
    const cwd = process.cwd();
    console.log('Args:', args);

    if (!args.name) {
        throw new Error(`You must pass a 'name' argument for the 'create project' script`);
    }

    const projectName = (args.name as string).trim();
    const projectType = args.type ?? 'svelte';
    const outputDir = path.join(cwd, ...(args.dir ? [args.dir as string] : []));

    console.log('Project name:', projectName);
    console.log('Project type:', projectType);
    console.log('Output dir:', outputDir);
};

export const createProjectOptions = {
    // required
    '(required) name': `The name of your project`,
    // optional
    '(optional) type': `What type of project to generate ('svelte' | 'svelteServer') (default 'svelte')`,
    '(optional) dir': `Where to generate the project (relative to cwd)`,
};
