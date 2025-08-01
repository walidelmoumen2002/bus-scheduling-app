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

// Define the type for a route based on your schema
type Route = {
    id: number;
    origin: string;
    destination: string;
    estimatedDurationMinutes: number;
};

export default function RoutesClientPage({ initialRoutes }: { initialRoutes: Route[] }) {
    const [routes, setRoutes] = useState<Route[]>(initialRoutes);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentRoute, setCurrentRoute] = useState<Partial<Route> | null>(null);

    const handleAddNew = () => {
        setCurrentRoute({ origin: '', destination: '', estimatedDurationMinutes: 0 });
        setIsDialogOpen(true);
    };

    const handleEdit = (route: Route) => {
        setCurrentRoute({ ...route });
        setIsDialogOpen(true);
    };

    const handleSaveRoute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentRoute) return;

        const isEditing = 'id' in currentRoute && currentRoute.id;
        const url = isEditing ? `/api/routes/${currentRoute.id}` : '/api/routes';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentRoute),
        });

        if (response.ok) {
            const savedRoute = await response.json();
            if (isEditing) {
                setRoutes(routes.map(r => r.id === savedRoute.id ? savedRoute : r));
            } else {
                setRoutes([...routes, savedRoute]);
            }
            setIsDialogOpen(false);
            setCurrentRoute(null);
        } else {
            const data = await response.json();
            alert(`Failed to save route: ${data.error || 'Unknown error'}`);
        }
    };

    const handleDeleteRoute = async (id: number) => {
        if (!confirm('Are you sure you want to delete this route?')) return;

        const response = await fetch('/api/routes', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (response.ok) {
            setRoutes(routes.filter(route => route.id !== id));
        } else {
            alert('Failed to delete route');
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Routes</h1>
                <Button onClick={handleAddNew}>Add New Route</Button>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentRoute && currentRoute.id ? 'Edit Route' : 'Add New Route'}</DialogTitle>
                        <DialogDescription>
                            {currentRoute && currentRoute.id
                                ? "Update the route's details."
                                : "Enter the details for the new route."}
                        </DialogDescription>
                    </DialogHeader>
                    {currentRoute && (
                        <form onSubmit={handleSaveRoute} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="origin">Origin</Label>
                                <Input
                                    id="origin"
                                    value={currentRoute.origin || ''}
                                    onChange={(e) => setCurrentRoute({ ...currentRoute, origin: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="destination">Destination</Label>
                                <Input
                                    id="destination"
                                    value={currentRoute.destination || ''}
                                    onChange={(e) => setCurrentRoute({ ...currentRoute, destination: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="estimatedDurationMinutes">Estimated Duration (minutes)</Label>
                                <Input
                                    id="estimatedDurationMinutes"
                                    type="number"
                                    value={currentRoute.estimatedDurationMinutes || ''}
                                    onChange={(e) => setCurrentRoute({ ...currentRoute, estimatedDurationMinutes: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <Button type="submit">Save Route</Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <div className="border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Origin</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Estimated Duration (minutes)</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {routes.map((route) => (
                            <TableRow key={route.id}>
                                <TableCell>{route.id}</TableCell>
                                <TableCell>{route.origin}</TableCell>
                                <TableCell>{route.destination}</TableCell>
                                <TableCell>{route.estimatedDurationMinutes}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(route)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteRoute(route.id)}>Delete</Button>
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