import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router";
import {Button, TextInput} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import ResourceBadge from "@/ui/components/resource-badge/index.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import {useGetAllCourses} from "@/services/course/query.js";

const ICON_THEMES = ['green', 'orange', 'purple', 'blue']
const ICON_BG = {
    green: 'rgba(24, 201, 106, 0.12)',
    orange: 'rgba(249, 115, 22, 0.12)',
    purple: 'rgba(139, 92, 246, 0.12)',
    blue: 'rgba(59, 130, 246, 0.12)',
}
const ICON_FG = {green: '#18C96A', orange: '#F97316', purple: '#8B5CF6', blue: '#3B82F6'}

export default function AdminCoursesPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const {data: courses, isLoading} = useGetAllCourses()

    useEffect(() => {
        setHeader({title: 'Courses'})
    }, [setHeader])

    const filtered = useMemo(() => {
        const list = courses ?? []
        if (!search) return list
        const q = search.toLowerCase()
        return list.filter(c => c.title?.toLowerCase().includes(q))
    }, [courses, search])

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
                <TextInput
                    size={'l'}
                    placeholder={'Search courses...'}
                    value={search}
                    onUpdate={setSearch}
                    style={{maxWidth: 360}}
                    startContent={
                        <span style={{paddingLeft: 8, display: 'inline-flex'}}>
                            <Icon name={'search'} size={16} color={'var(--it-text-secondary)'}/>
                        </span>
                    }
                />
                <Button
                    view={'action'}
                    size={'l'}
                    onClick={() => navigate('/admin/courses/new')}
                >
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                        <Icon name={'plus'} size={16} color={'#FFFFFF'}/>
                        Add Course
                    </span>
                </Button>
            </div>

            {isLoading && (
                <SectionCard>
                    <span style={{color: 'var(--it-text-secondary)'}}>Loading courses...</span>
                </SectionCard>
            )}

            {!isLoading && filtered.length === 0 && (
                <SectionCard>
                    <span style={{color: 'var(--it-text-secondary)'}}>No courses yet.</span>
                </SectionCard>
            )}

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16}}>
                {filtered.map((c, i) => {
                    const t = ICON_THEMES[i % ICON_THEMES.length]
                    return (
                        <SectionCard key={c.id} style={{cursor: 'pointer'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 10,
                                        background: ICON_BG[t],
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Icon name={'book-open'} color={ICON_FG[t]} size={22}/>
                                </div>
                                <ResourceBadge active={c.isActive}>{c.isActive ? 'Active' : 'Draft'}</ResourceBadge>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                                <span style={{fontSize: 16, fontWeight: 700}}>{c.title}</span>
                                <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                                    {c.description ?? 'No description'}
                                </span>
                            </div>
                            <div style={{display: 'flex', gap: 16}}>
                                <Stat value={c.units?.length ?? 0} label={'Units'}/>
                                <Stat value={c.lessonsCount ?? 0} label={'Lessons'}/>
                                <Stat value={c.price ?? 0} label={'Price'}/>
                            </div>
                            <Button view={'outlined'} onClick={() => navigate(`/admin/courses/${c.id}`)} width={'max'}>
                                Manage
                            </Button>
                        </SectionCard>
                    )
                })}
            </div>
        </div>
    )
}

function Stat({value, label}) {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <span style={{fontSize: 18, fontWeight: 700}}>{value}</span>
            <span style={{fontSize: 11, color: 'var(--it-text-secondary)'}}>{label}</span>
        </div>
    )
}
