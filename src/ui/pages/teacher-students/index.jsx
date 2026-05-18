import {useEffect, useState} from "react";
import {TextInput} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";
import DataTable from "@/ui/components/data-table/index.jsx";
import ResourceBadge from "@/ui/components/resource-badge/index.jsx";

const STUDENTS = [
    {id: 1, name: 'Anton Tomas', initials: 'AT', course: 'Algebra & Functions', progress: 78, active: true},
    {id: 2, name: 'Yuliya Misyura', initials: 'YM', course: 'Calculus Fundamentals', progress: 42, active: true},
    {id: 3, name: 'Farrux Nuriddinov', initials: 'FN', course: 'Algebra & Functions', progress: 92, active: true},
    {id: 4, name: 'Madina Yusupova', initials: 'MY', course: 'Linear Algebra', progress: 18, active: false},
]

const PALETTES = ['gray', 'purple', 'blue', 'green']

export default function TeacherStudentsPage() {
    const {setHeader} = useHeader()
    const [search, setSearch] = useState('')

    useEffect(() => {
        setHeader({title: 'My Students'})
    }, [setHeader])

    const filtered = STUDENTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <TextInput
                size={'l'}
                placeholder={'Search students...'}
                value={search}
                onUpdate={setSearch}
                style={{maxWidth: 360}}
                startContent={
                    <span style={{paddingLeft: 8, display: 'inline-flex'}}>
                        <Icon name={'search'} size={16} color={'var(--it-text-secondary)'}/>
                    </span>
                }
            />

            <DataTable
                columns={[
                    {title: '#', render: (_, i) => <span style={{color: 'var(--it-text-secondary)'}}>{i + 1}</span>},
                    {
                        title: 'Student',
                        render: (r) => (
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <Avatar initials={r.initials} palette={PALETTES[r.id % PALETTES.length]} size={32}/>
                                <span style={{fontWeight: 600}}>{r.name}</span>
                            </div>
                        ),
                    },
                    {title: 'Course', key: 'course'},
                    {
                        title: 'Progress',
                        render: (r) => (
                            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <div style={{
                                    width: 100,
                                    height: 6,
                                    borderRadius: 3,
                                    background: '#F3F4F6',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${r.progress}%`,
                                        height: '100%',
                                        background: 'var(--it-green)'
                                    }}/>
                                </div>
                                <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>{r.progress}%</span>
                            </div>
                        ),
                    },
                    {title: 'Status', render: (r) => <ResourceBadge active={r.active}/>},
                ]}
                rows={filtered}
            />
        </div>
    )
}
