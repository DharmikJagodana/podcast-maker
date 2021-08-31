require('dotenv').config();
import { Command } from 'commander';

import {
    cleanTmp,
    createAndUploadInstagram,
    createAndUploadYouTube,
    createInstagram,
    createNewContent,
    createTTS,
    createYouTube,
    uploadInstagram,
    uploadYouTube,
    validateLatestContent,
    createPodcast,
    uploadAnchor,
    createAndUploadAnchor,
    mailToContent,
} from './options';
import { error, log } from './utils/log';

const program = new Command();
program
    .option('-b, --build', 'Create video and upload to YouTube')
    .option('-f, --file <filename>', 'Define content file to build video')
    .option(
        '-s, --config <option>',
        `Select config to build video. 
                                Options: 
                                    - tts 
                                    - youtube 
                                    - youtubeCreate (not upload) 
                                    - youtubeUpload (not create) 
                                    - instagram 
                                    - instagramCreate (not upload) 
                                    - instagramUpload (not create) 
                                    - anchor
                                    - podcastCreate (not upload)
                                    - anchorUpload

        `,
        'youtube',
    )
    .option('-tts, --tts', 'Need to create TTS', false)
    .option(
        '-m, --mailToContent',
        "Get today's newsletter mail and create JSON content file",
    )
    .option(
        '-c, --create <description>',
        'Create new content file with default labels',
    )
    .option(
        '-v, --validate',
        'Validates if all necessary labels in last content was filled',
    )
    .option('-rm, --clean', 'Clean tmp dir')
    .parse(process.argv);

const options = program.opts();

if (Object.keys(options).length <= 0) {
    error('No options selected');
}

(async () => {
    const beginTime = Date.now();

    if (options.create) {
        createNewContent(options.create);
    }

    if (options.validate) {
        validateLatestContent();
    }

    if (options.mailToContent) {
        await mailToContent();
    }

    if (options.build) {
        const contentFileName = options.file;
        const needTTS = options.tts;
        const option = options.config as
            | 'tts'
            | 'youtube'
            | 'youtubeCreate'
            | 'youtubeUpload'
            | 'instagram'
            | 'instagramCreate'
            | 'instagramUpload'
            | 'anchor'
            | 'podcastCreate'
            | 'anchorUpload';

        switch (option) {
            case 'tts':
                await createTTS({ contentFileName });
                break;

            case 'youtube':
                await createAndUploadYouTube({ contentFileName, needTTS });
                break;

            case 'youtubeCreate':
                await createYouTube({ contentFileName, needTTS });
                break;

            case 'youtubeUpload':
                await uploadYouTube();
                break;

            case 'instagram':
                await createAndUploadInstagram({ contentFileName, needTTS });
                break;

            case 'instagramCreate':
                await createInstagram({ contentFileName, needTTS });
                break;

            case 'instagramUpload':
                await uploadInstagram();
                break;

            case 'podcastCreate':
                await createPodcast({ contentFileName, needTTS });
                break;

            case 'anchorUpload':
                await uploadAnchor();
                break;

            case 'anchor':
                await createAndUploadAnchor({ contentFileName, needTTS });
                break;

            default:
                error('Invalid build options', 'Main');
        }
    }

    if (options.clean) {
        cleanTmp();
    }

    log(
        `Process finished in ${Math.round(
            (Date.now() - beginTime) / 1000,
        )} seconds`,
        'Main',
    );

    process.exit(0);
})();
