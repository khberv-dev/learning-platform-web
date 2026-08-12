import {useRef} from 'react';
import {Button} from '@gravity-ui/uikit';
import {Upload} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useUploadMyIntroVideo} from '@/services/mentor/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import SettingsPage from '@/ui/pages/settingsPage.jsx';
import PageSection from '@/ui/components/pageSection.jsx';

// Mentors get one extra card over the shared settings page: their intro video,
// which students see when picking a mentor.
function IntroVideoSection() {
    const {t} = useI18n();
    const uploadVideo = useUploadMyIntroVideo();
    const fileInputRef = useRef(null);

    const handlePicked = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        uploadVideo.mutate(file, {
            onSuccess: () =>
                toaster.add({name: 'intro-video', theme: 'success', title: t('common.saved')}),
            onError: (error) =>
                toaster.add({
                    name: 'intro-video-failed',
                    theme: 'danger',
                    title: extractApiErrorMessage(error, t('common.error')),
                }),
        });
    };

    return (
        <PageSection
            title={t('mentor.introVideo')}
            actions={
                <Button onClick={() => fileInputRef.current?.click()} loading={uploadVideo.isPending}>
                    <Button.Icon>
                        <Upload size={16}/>
                    </Button.Icon>
                    {t('mentor.uploadVideo')}
                </Button>
            }
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                style={{display: 'none'}}
                onChange={handlePicked}
            />
            <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                {t('mentor.introVideoHint')}
            </div>
        </PageSection>
    );
}

function MentorSettings() {
    return <SettingsPage extra={<IntroVideoSection/>}/>;
}

export default MentorSettings;
