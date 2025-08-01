"use client";

import { useState } from "react";
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
    DialogDescription,
} from "@/components/ui/dialog";

// Define the type for a bus based on your schema
type Bus = {
    id: number;
    plateNumber: string;
    capacity: number;
};

export default function BusesClientPage({ initialBuses }: { initialBuses: Bus[] }) {
    const [buses, setBuses] = useState<Bus[]>(initialBuses);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentBus, setCurrentBus] = useState<Partial<Bus> | null>(null);

    const handleAddNew = () => {
        setCurrentBus({ plateNumber: '', capacity: 0 });
        setIsDialogOpen(true);
    };

    const handleEdit = (bus: Bus) => {
        setCurrentBus({ ...bus });
        setIsDialogOpen(true);
    };

    const handleSaveBus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentBus) return;

        const isEditing = 'id' in currentBus && currentBus.id;
        const url = isEditing ? `/api/buses/${currentBus.id}` : '/api/buses';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentBus),
        });

        if (response.ok) {
            const savedBus = await response.json();
            if (isEditing) {
                setBuses(buses.map(b => b.id === savedBus.id ? savedBus : b));
            } else {
                setBuses([...buses, savedBus]);
            }
            setIsDialogOpen(false);
            setCurrentBus(null);
        } else {
            const data = await response.json();
            alert(`Failed to save bus: ${data.error || 'Unknown error'}`);
        }
    };

    const handleDeleteBus = async (id: number) => {
        if (!confirm('Are you sure you want to delete this bus?')) return;

        const response = await fetch(`/api/buses`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (response.ok) {
            setBuses(buses.filter(bus => bus.id !== id));
        } else {
            alert('Failed to delete bus');
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Buses</h1>
                <Button onClick={handleAddNew}>Add New Bus</Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentBus && currentBus.id ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
                        <DialogDescription>
                            {currentBus && currentBus.id
                                ? "Update the bus's details."
                                : "Enter the details for the new bus."}
                        </DialogDescription>
                    </DialogHeader>
                    {currentBus && (
                        <form onSubmit={handleSaveBus} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="plateNumber">Plate Number</Label>
                                <Input
                                    id="plateNumber"
                                    value={currentBus.plateNumber || ''}
                                    onChange={(e) => setCurrentBus({ ...currentBus, plateNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    value={currentBus.capacity || ''}
                                    onChange={(e) => setCurrentBus({ ...currentBus, capacity: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <Button type="submit">Save Bus</Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

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
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(bus)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteBus(bus.id)}>Delete</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}