"use client";

import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


// Define types based on schema
type Driver = { id: number; name: string; licenseNumber: string; available: boolean };
type Bus = { id: number; plateNumber: string; capacity: number };
type Route = { id: number; origin: string; destination: string; estimatedDurationMinutes: number };
type Shift = {
    id: number;
    driverName: string | null;
    busPlateNumber: string | null;
    routeOrigin: string | null;
    routeDestination: string | null;
    shiftStart: string;
    shiftEnd: string;
};
type User = {
    userId: number;
    role: string;
};

interface ShiftsClientPageProps {
    initialShifts: Shift[];
    drivers: Driver[];
    buses: Bus[];
    routes: Route[];
    user: User | null;
}

export default function ShiftsClientPage({ initialShifts, drivers, buses, routes, user }: ShiftsClientPageProps) {
    const [shifts, setShifts] = useState<Shift[]>(initialShifts);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [driverId, setDriverId] = useState<string>('');
    const [busId, setBusId] = useState<string>('');
    const [routeId, setRouteId] = useState<string>('');
    const [shiftStart, setShiftStart] = useState('');
    const [shiftEnd, setShiftEnd] = useState('');
    const [error, setError] = useState('');

    // Filter state
    const [dateFilter, setDateFilter] = useState('');
    const [driverFilter, setDriverFilter] = useState('all');
    const [busFilter, setBusFilter] = useState('all');

    const canManage = user?.role === 'admin' || user?.role === 'dispatcher';

    const filteredShifts = useMemo(() => {
        return shifts.filter(shift => {
            const shiftDate = new Date(shift.shiftStart);
            const filterDate = dateFilter ? new Date(dateFilter) : null;

            const dateMatch = !filterDate || (
                shiftDate.getUTCFullYear() === filterDate.getUTCFullYear() &&
                shiftDate.getUTCMonth() === filterDate.getUTCMonth() &&
                shiftDate.getUTCDate() === filterDate.getUTCDate()
            );

            const driverMatch = driverFilter === 'all' || shift.driverName === driverFilter;
            const busMatch = busFilter === 'all' || shift.busPlateNumber === busFilter;

            return dateMatch && driverMatch && busMatch;
        });
    }, [shifts, dateFilter, driverFilter, busFilter]);


    const resetForm = () => {
        setDriverId('');
        setBusId('');
        setRouteId('');
        setShiftStart('');
        setShiftEnd('');
        setError('');
    };

    const handleAddShift = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const response = await fetch('/api/shifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                driverId: Number(driverId),
                busId: Number(busId),
                routeId: Number(routeId),
                shiftStart,
                shiftEnd,
            }),
        });

        if (response.ok) {
            const newShift = await response.json();
            const driver = drivers.find(d => d.id === newShift.driverId);
            const bus = buses.find(b => b.id === newShift.busId);
            const route = routes.find(r => r.id === newShift.routeId);

            const newShiftWithDetails: Shift = {
                ...newShift,
                driverName: driver?.name ?? null,
                busPlateNumber: bus?.plateNumber ?? null,
                routeOrigin: route?.origin ?? null,
                routeDestination: route?.destination ?? null,
                shiftStart: newShift.shiftStart,
                shiftEnd: newShift.shiftEnd
            };

            setShifts([...shifts, newShiftWithDetails]);
            resetForm();
            setIsDialogOpen(false);
        } else {
            const data = await response.json();
            setError(data.error || 'Failed to add shift');
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Shift Schedule</h1>
                {canManage &&
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button>Assign New Shift</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Assign New Shift</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddShift} className="grid gap-4 py-4">
                                {/* Driver Select */}
                                <div className="grid gap-2">
                                    <Label htmlFor="driver">Driver</Label>
                                    <Select value={driverId} onValueChange={setDriverId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a driver" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {drivers.map(driver => (
                                                <SelectItem key={driver.id} value={String(driver.id)}>
                                                    {driver.name} ({driver.licenseNumber})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Bus Select */}
                                <div className="grid gap-2">
                                    <Label htmlFor="bus">Bus</Label>
                                    <Select value={busId} onValueChange={setBusId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a bus" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {buses.map(bus => (
                                                <SelectItem key={bus.id} value={String(bus.id)}>
                                                    {bus.plateNumber} (Capacity: {bus.capacity})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Route Select */}
                                <div className="grid gap-2">
                                    <Label htmlFor="route">Route</Label>
                                    <Select value={routeId} onValueChange={setRouteId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a route" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {routes.map(route => (
                                                <SelectItem key={route.id} value={String(route.id)}>
                                                    {route.origin} to {route.destination}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Shift Timestamps */}
                                <div className="grid gap-2">
                                    <Label htmlFor="shiftStart">Shift Start</Label>
                                    <Input id="shiftStart" type="datetime-local" value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="shiftEnd">Shift End</Label>
                                    <Input id="shiftEnd" type="datetime-local" value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} required />
                                </div>

                                {error && <p className="text-sm text-red-500">{error}</p>}
                                <Button type="submit">Assign Shift</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                }
            </div>

            {/* --- FILTER CONTROLS --- */}
            <div className="flex items-center gap-4 mb-4 p-4 border rounded-lg bg-muted/50">
                <div className="grid gap-2">
                    <Label htmlFor="date-filter">Filter by Date</Label>
                    <Input id="date-filter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-48" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="driver-filter">Filter by Driver</Label>
                    <Select value={driverFilter} onValueChange={setDriverFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select a driver" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Drivers</SelectItem>
                            {drivers.map(driver => (
                                <SelectItem key={driver.id} value={driver.name}>
                                    {driver.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="bus-filter">Filter by Bus</Label>
                    <Select value={busFilter} onValueChange={setBusFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select a bus" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Buses</SelectItem>
                            {buses.map(bus => (
                                <SelectItem key={bus.id} value={bus.plateNumber}>
                                    {bus.plateNumber}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="self-end">
                    <Button variant="outline" onClick={() => {
                        setDateFilter('');
                        setDriverFilter('all');
                        setBusFilter('all');
                    }}>
                        Clear Filters
                    </Button>
                </div>
            </div>


            <div className="border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Driver</TableHead>
                            <TableHead>Bus</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Shift Start</TableHead>
                            <TableHead>Shift End</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredShifts.map((shift) => (
                            <TableRow key={shift.id}>
                                <TableCell>{shift.driverName ?? 'N/A'}</TableCell>
                                <TableCell>{shift.busPlateNumber ?? 'N/A'}</TableCell>
                                <TableCell>{shift.routeOrigin && shift.routeDestination ? `${shift.routeOrigin} to ${shift.routeDestination}` : 'N/A'}</TableCell>
                                <TableCell>{new Date(shift.shiftStart).toLocaleString()}</TableCell>
                                <TableCell>{new Date(shift.shiftEnd).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}