import {ImageIcon} from 'lucide-react';

export function CourseThumb({course}) {
    const image = course?.image || null;

    return (
        <div
            style={{
                width: 56,
                height: 38,
                borderRadius: 6,
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--g-color-base-generic)',
                color: 'var(--g-color-text-secondary)',
            }}
        >
            {image ? (
                <img src={image} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
            ) : (
                <ImageIcon size={16}/>
            )}
        </div>
    );
}

// The shared "which course is this" table cell: thumbnail, title, and the
// description ellipsized underneath - the courses list's own title column,
// reused wherever a row is about a course.
function CourseCell({course}) {
    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 12, minWidth: 0}}>
            <CourseThumb course={course}/>
            <div style={{minWidth: 0}}>
                <div style={{fontWeight: 500}}>{course?.title ?? '—'}</div>
                <div
                    style={{
                        fontSize: 12,
                        color: 'var(--g-color-text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 420,
                    }}
                >
                    {course?.description || '—'}
                </div>
            </div>
        </div>
    );
}

export default CourseCell;
