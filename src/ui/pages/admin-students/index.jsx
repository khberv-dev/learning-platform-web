import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {Button, TextInput} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";
import DataTable from "@/ui/components/data-table/index.jsx";
import ResourceBadge from "@/ui/components/resource-badge/index.jsx";

const PALETTES = ['gray', 'purple', 'blue', 'green']

const STUDENTS = [
    {id: 1, name: 'Anton Tomas', initials: 'AT', phoneNumber: '+998901112233', courses: 3, paid: true, active: true},
    {id: 2, name: 'Yuliya Misyura', initials: 'YM', phoneNumber: '+998937770000', courses: 2, paid: true, active: true},
    {id: 3, name: 'Farrux Nuriddinov', initials: 'FN', phoneNumber: '+998904567890', courses: 4, paid: false, active: true},
    {id: 4, name: 'Madina Yusupova', initials: 'MY', phoneNumber: '+998931233444', courses: 1, paid: true, active: false},
    {id: 5, name: 'Bekzod Ergashev', initials: 'BE', phoneNumber: '+998945556677', courses: 5, paid: true, active: true},
]

export default function AdminStudentsPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')

    useEffect(() => {
        setHeader({title: 'Students'})
    }, [setHeader])

    const filtered = STUDENTS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
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
                <Button
                    view={'action'}
                    size={'l'}
                >
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                        <Icon name={'plus'} size={16} color={'#FFFFFF'}/>
                        Add Student
                    </span>
                </Button>
            </div>

            <DataTable
                columns={[
                    {title: '#', render: (_, i) => <span style={{color: 'var(--it-text-secondary)'}}>{i + 1}</span>},
                    {
                        title: 'Full Name',
                        render: (r) => (
                            <div
                                style={{display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer'}}
                                onClick={() => navigate(`/admin/students/${r.id}`)}
                            >
                                <Avatar initials={r.initials} palette={PALETTES[r.id % PALETTES.length]} size={32}/>
                                <span style={{fontWeight: 600}}>{r.name}</span>
                            </div>
                        ),
                    },
                    {title: 'Phone', key: 'phoneNumber'},
                    {title: 'Courses', key: 'courses'},
                    {
                        title: 'Payment',
                        render: (r) => (
                            <ResourceBadge theme={r.paid ? 'success' : 'neutral'}>
                                {r.paid ? 'Paid' : 'Free'}
                            </ResourceBadge>
                        ),
                    },
                    {title: 'Status', render: (r) => <ResourceBadge active={r.active}/>},
                    {
                        title: 'Actions', align: 'right',
                        render: (r) => (
                            <div style={{display: 'inline-flex', gap: 8}}>
                                <Button view={'flat'} onClick={() => navigate(`/admin/students/${r.id}/edit`)}>
                                    <Icon name={'pencil'} size={16} color={'var(--it-text-secondary)'}/>
                                </Button>
                                <Button view={'flat'}>
                                    <Icon name={'trash'} size={16} color={'var(--it-danger-text)'}/>
                                </Button>
                            </div>
                        ),
                    },
                ]}
                rows={filtered}
            />
        </div>
    )
}
