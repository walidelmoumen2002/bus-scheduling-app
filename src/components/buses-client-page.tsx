"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

// Define the type for a bus based on your schema
type Bus = {
    id: number;
    plateNumber: string;
    capacity: number;
};

export default function BusesClientPage({ initialBuses }: { initialBuses: Bus[] }) {
    const [buses, setBuses] = useState<Bus[]>(initialBuses);
    const [plateNumber, setPlateNumber] = useState('');
    const [capacity, setCapacity] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    const handleAddBus = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/buses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plateNumber, capacity }),
        });

        if (response.ok) {
            const newBus = await response.json();
            setBuses([...buses, newBus]);
            setPlateNumber('');
            setCapacity('');
            setIsDialogOpen(false);
            router.refresh(); // Refresh the page to show the new bus
        } else {
            alert('Failed to add bus');
        }
    };

    const handleDeleteBus = async (id: number) => {
        if (!confirm('Are you sure you want to delete this bus?')) return;

        const response = await fetch('/api/buses', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (response.ok) {
            setBuses(buses.filter(bus => bus.id !== id));
            router.refresh(); // Refresh the page
        } else {
            alert('Failed to delete bus');
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Buses</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Add New Bus</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Bus</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddBus} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="plateNumber">Plate Number</Label>
                                <Input id="plateNumber" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
                            </div>
                            <Button type="submit">Add Bus</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Plate Number</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {buses.map((bus) => (
                            <TableRow key={bus.id}>
                                <TableCell>{bus.id}</TableCell>
                                <TableCell>{bus.plateNumber}</TableCell>
                                <TableCell>{bus.capacity}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" className="mr-2" disabled>Edit</Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteBus(bus.id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}