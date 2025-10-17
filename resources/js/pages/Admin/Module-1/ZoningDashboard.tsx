import { Map, FileText, MapPin, CheckCircle, Plus, Search, Filter, Users, DollarSign, Clock, AlertCircle } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import SearchInput from '../../../components/SearchInput';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import ZoningApplicationsTable from './ZoningApplicationsTable';

const ZoningDashboard = () => {
    // Mock statistics - in real app, these would come from API
    const stats = [
        {
            title: 'Total Applications',
            value: '24',
            change: '+12%',
            icon: FileText,
            color: 'bg-blue-500',
            textColor: 'text-blue-600'
        },
        {
            title: 'Pending Review',
            value: '8',
            change: '+2',
            icon: Clock,
            color: 'bg-yellow-500',
            textColor: 'text-yellow-600'
        },
        {
            title: 'Approved',
            value: '12',
            change: '+5',
            icon: CheckCircle,
            color: 'bg-green-500',
            textColor: 'text-green-600'
        },
        {
            title: 'Payment Pending',
            value: '4',
            change: '-1',
            icon: DollarSign,
            color: 'bg-orange-500',
            textColor: 'text-orange-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex-shrink-0 mb-4 pb-2">
                <div className="flex justify-between items-start">
                    <Header 
                        variant="secondary"
                        title="Zoning Clearance Dashboard"
                        subtext="Manage zoning applications and compliance reviews."
                    />
                    
          {/* Controls next to header */}
          <div className="flex items-center gap-3">
            <Button variant="outline" icon={<Map size={16} />}>
              View Map
            </Button>
          </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.change} from last month</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.color}`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Applications Table */}
            <ZoningApplicationsTable />
        </div>
    );
};

// Add default layout for persistent sidebar/topnav
ZoningDashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default ZoningDashboard;
