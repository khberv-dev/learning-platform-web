import {useRef} from 'react';
import {Button, Select, SegmentedRadioGroup} from '@gravity-ui/uikit';
import {Upload} from 'lucide-react';
import {LOCALE_OPTIONS, useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useThemeMode} from '@/shared/theme/themeModeContext.jsx';
import {useMe, useUpdateMyAvatar} from '@/services/user/query.js';
import {formatPhone, fullName} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import UserAvatar from '@/ui/components/userAvatar.jsx';

// Profile, theme and language - identical for both roles, so both panels'
// settings routes render this.
function SettingsPage({extra}) {
    const {t, locale, setLocale} = useI18n();
    const {themeMode, setThemeMode} = useThemeMode();
    const {data: me} = useMe();
    const updateAvatar = useUpdateMyAvatar();
    const fileInputRef = useRef(null);

    const name = fullName(me);

    const handleAvatarPicked = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        updateAvatar.mutate(file, {
            onSuccess: () => toaster.add({name: 'avatar', theme: 'success', title: t('common.saved')}),
            onError: (error) =>
                toaster.add({
                    name: 'avatar-failed',
                    theme: 'danger',
                    title: extractApiErrorMessage(error, t('common.error')),
                }),
        });
    };

    return (
        <>
            <PageHeader title={t('settings.title')}/>

            <div style={{display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560}}>
                <PageSection title={t('settings.profile')}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                        <UserAvatar avatar={me?.avatar} name={name} size="xl"/>
                        <div style={{minWidth: 0}}>
                            <div style={{fontSize: 15, fontWeight: 600}}>{name || '—'}</div>
                            <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                                {formatPhone(me?.phoneNumber)}
                            </div>
                            {me?.email && (
                                <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                                    {me.email}
                                </div>
                            )}
                        </div>
                        <div style={{marginLeft: 'auto'}}>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                loading={updateAvatar.isPending}
                            >
                                <Button.Icon>
                                    <Upload size={16}/>
                                </Button.Icon>
                                {t('settings.uploadAvatar')}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{display: 'none'}}
                                onChange={handleAvatarPicked}
                            />
                        </div>
                    </div>
                </PageSection>

                {extra}

                <PageSection title={t('settings.appearance')}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                        <div>
                            <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)', marginBottom: 6}}>
                                {t('settings.theme')}
                            </div>
                            <SegmentedRadioGroup value={themeMode} onUpdate={setThemeMode}>
                                <SegmentedRadioGroup.Option value="light">
                                    {t('settings.light')}
                                </SegmentedRadioGroup.Option>
                                <SegmentedRadioGroup.Option value="dark">
                                    {t('settings.dark')}
                                </SegmentedRadioGroup.Option>
                            </SegmentedRadioGroup>
                        </div>
                        <div>
                            <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)', marginBottom: 6}}>
                                {t('settings.language')}
                            </div>
                            <Select value={[locale]} onUpdate={([value]) => setLocale(value)} width={200}>
                                {LOCALE_OPTIONS.map((option) => (
                                    <Select.Option key={option.value} value={option.value}>
                                        {option.content}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </PageSection>
            </div>
        </>
    );
}

export default SettingsPage;
