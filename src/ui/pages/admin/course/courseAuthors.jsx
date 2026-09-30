import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Button, Select} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useAuthors} from '@/services/author/query.js';
import {useSetCourseAuthors} from '@/services/course/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageSection from '@/ui/components/pageSection.jsx';
import UserAvatar from '@/ui/components/userAvatar.jsx';
import {EmptyState} from '@/ui/components/stateViews.jsx';

const authorName = (author) => `${author.firstName} ${author.lastName}`;

// Assignment is one replace-the-whole-set PUT, so the picker edits a draft of
// the full id list and saves it in one go. Seeded from `course.authors` and
// keyed on those ids by the caller, so a save (which refetches the course)
// re-seeds it without an effect.
function CourseAuthorsEditor({courseId, current}) {
    const {t} = useI18n();
    // 100 is the API's cap on `limit` and covers every author in one request;
    // the picker has no paging of its own.
    const authors = useAuthors({page: 1, limit: 100});
    const setCourseAuthors = useSetCourseAuthors();
    const [selected, setSelected] = useState(current.map((author) => author.id));

    const initialIds = current.map((author) => author.id);
    const dirty =
        selected.length !== initialIds.length || selected.some((authorId) => !initialIds.includes(authorId));

    // Currently credited authors are merged in so their chips still render if
    // they fall outside the fetched page.
    const byId = new Map(current.map((author) => [author.id, author]));
    (authors.data?.data ?? []).forEach((author) => byId.set(author.id, author));

    const save = () => {
        setCourseAuthors.mutate(
            {id: courseId, authorIds: selected},
            {
                onSuccess: () => toaster.add({name: 'course-authors-saved', theme: 'success', title: t('common.saved')}),
                onError: (error) =>
                    toaster.add({
                        name: 'course-authors-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    const selectedAuthors = selected.map((authorId) => byId.get(authorId)).filter(Boolean);

    return (
        <PageSection title={t('author.title')} description={t('author.courseHint')}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560}}>
                <Select
                    size="l"
                    width="max"
                    multiple
                    filterable
                    hasClear
                    loading={authors.isPending}
                    placeholder={t('author.pick')}
                    value={selected}
                    onUpdate={setSelected}
                >
                    {[...byId.values()].map((author) => (
                        <Select.Option key={author.id} value={author.id}>
                            {authorName(author)}
                        </Select.Option>
                    ))}
                </Select>

                {selectedAuthors.length === 0 ? (
                    <EmptyState title={t('author.noneOnCourse')}/>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        {selectedAuthors.map((author) => (
                            <Link
                                key={author.id}
                                to={`/admin/course/authors/${author.id}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    color: 'inherit',
                                    textDecoration: 'none',
                                }}
                            >
                                <UserAvatar avatar={author.avatar} name={authorName(author)} size="s"/>
                                <span style={{fontWeight: 500}}>{authorName(author)}</span>
                            </Link>
                        ))}
                    </div>
                )}

                <div>
                    <Button
                        view="action"
                        size="l"
                        disabled={!dirty}
                        loading={setCourseAuthors.isPending}
                        onClick={save}
                    >
                        {t('common.save')}
                    </Button>
                </div>
            </div>
        </PageSection>
    );
}

function CourseAuthors({course}) {
    const current = course.authors ?? [];

    return (
        <CourseAuthorsEditor
            key={current.map((author) => author.id).join(',')}
            courseId={course.id}
            current={current}
        />
    );
}

export default CourseAuthors;
