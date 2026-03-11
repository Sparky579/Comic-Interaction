const imageModules = import.meta.glob('./tests/**/*.{png,jpg,jpeg}', {
  eager: true,
  import: 'default',
});

const textModules = import.meta.glob('./tests/**/*.{md,txt}', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const datasetMeta = {
  Apache_License: {
    label: 'Apache License',
    shortLabel: 'Apache',
    summary: 'Storyboard translating Apache 2.0 concepts into readable comic scenes.',
    notes:
      'Useful for explanation-heavy HCI studies where legal or technical content needs panel-by-panel narrative support.',
  },
  Apache_New: {
    label: 'Apache New',
    shortLabel: 'Apache New',
    summary: 'Alternative Apache sequence with slightly denser pacing and different framing.',
    notes:
      'Suitable for comparing how layout changes affect comprehension and visual attention.',
  },
  MIT_License: {
    label: 'MIT License',
    shortLabel: 'MIT',
    summary: 'Compact set illustrating the MIT license through simpler scenes and fewer panels.',
    notes:
      'Good baseline condition when you want a shorter, more direct narrative arc.',
  },
  locking: {
    label: 'Locking',
    shortLabel: 'Locking',
    summary: 'Example sequence focused on locking and restriction metaphors in comic form.',
    notes:
      'Useful when evaluating whether users understand constraint-oriented or safety-oriented visual metaphors.',
  },
  paper: {
    label: 'Paper',
    shortLabel: 'Paper',
    summary: 'Longer manuscript-like comic set with more pages and sequential progression.',
    notes:
      'Best for longitudinal reading tasks and note-taking sessions across a larger number of frames.',
  },
};

const folderSortOrder = ['Apache_License', 'Apache_New', 'MIT_License', 'locking', 'paper'];

const fileSort = (a, b) =>
  a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: 'base',
  });

const imagesByFolder = Object.entries(imageModules).reduce((acc, [path, url]) => {
  const match = path.match(/\.\/tests\/([^/]+)\/(.+)$/);

  if (!match) {
    return acc;
  }

  const [, folder, fileName] = match;

  if (!acc[folder]) {
    acc[folder] = [];
  }

  acc[folder].push({ fileName, imageUrl: url });
  return acc;
}, {});

const textsByFolder = Object.entries(textModules).reduce((acc, [path, content]) => {
  const match = path.match(/\.\/tests\/([^/]+)\/(.+)$/);

  if (!match) {
    return acc;
  }

  const [, folder, fileName] = match;

  if (!acc[folder]) {
    acc[folder] = [];
  }

  acc[folder].push({ fileName, content });
  return acc;
}, {});

export const comicDatasets = folderSortOrder
  .filter((folder) => imagesByFolder[folder]?.length)
  .map((folder) => {
    const meta = datasetMeta[folder] ?? {
      label: folder,
      shortLabel: folder,
      summary: `${folder} dataset`,
      notes: 'No dataset notes available.',
    };

    const pages = imagesByFolder[folder]
      .sort((a, b) => fileSort(a.fileName, b.fileName))
      .map(({ fileName, imageUrl }, index) => ({
        id: `${folder}-${index + 1}`,
        page_number: index + 1,
        imageUrl,
        title: `${meta.shortLabel} · Page ${index + 1}`,
        description: `${meta.label} frame ${index + 1}: ${fileName.replace(/\.[^.]+$/, '')}.`,
      }));

    const sourceEntries = (textsByFolder[folder] ?? []).sort((a, b) => fileSort(a.fileName, b.fileName));
    const fallbackSourceText = [
      `${meta.label}`,
      '',
      `Summary: ${meta.summary}`,
      '',
      `Notes: ${meta.notes}`,
      '',
      ...pages.map(
        (page) => `Page ${page.page_number}: ${page.description}`
      ),
    ].join('\n');

    const sourceText = sourceEntries.length
      ? sourceEntries
          .map(({ fileName, content }) => `${fileName}\n\n${content.trim()}`)
          .join('\n\n')
      : fallbackSourceText;

    return {
      id: folder,
      ...meta,
      pageCount: pages.length,
      coverImage: pages[0]?.imageUrl ?? '',
      sourceText,
      pages,
    };
  });

export const defaultDatasetId = comicDatasets[0]?.id ?? '';

export const initialStylePresets = [
  {
    id: 'editorial',
    title: 'Editorial clarity',
    description: 'Clean composition with readable framing and restrained detail.',
    prompt: 'Prioritize readability, balanced composition, and clear visual storytelling.',
  },
  {
    id: 'storyboard',
    title: 'Storyboard study',
    description: 'Loose visual treatment focused on shot planning and pacing.',
    prompt: 'Keep the layout structured, cinematic, and easy to iterate on.',
  },
  {
    id: 'annotated',
    title: 'Annotated review',
    description: 'Presentation-oriented style with space for explanation and notes.',
    prompt: 'Use a neat review-friendly look with stable framing and informative detail.',
  },
];

export const mockChatHistory = [
  {
    id: 1,
    sender: 'ai',
    text: 'Use this panel to capture usability observations, narrative issues, or participant comments while reviewing each comic page.',
  },
  {
    id: 2,
    sender: 'user',
    text: 'The current sequence is easy to follow, but page transitions could be more explicit for first-time readers.',
  },
  {
    id: 3,
    sender: 'ai',
    text: 'Noted. Compare whether different datasets change reading speed, confidence, or the amount of explanation participants request.',
  },
];

export const mockAiResponses = [
  'Consider noting whether the visual metaphor matches the participant’s own explanation.',
  'You can log a page-specific observation here before moving to the next frame.',
  'Try comparing this dataset against another folder to see whether the layout improves comprehension.',
  'The square canvas leaves more stable room for side notes during live study sessions.',
  'Capture any confusion about sequencing, labels, or icon meaning in this note panel.',
];
