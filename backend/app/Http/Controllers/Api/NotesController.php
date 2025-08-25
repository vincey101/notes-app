<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $notes = $request->user()->notes()->latest()->get();
        
        return response()->json([
            'notes' => $notes
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string'
        ]);

        $note = $request->user()->notes()->create($validated);

        return response()->json([
            'message' => 'Note created successfully',
            'note' => $note
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Note $note): JsonResponse
    {
        // Check if the user owns the note
        if ($request->user()->id !== $note->user_id) {
            return response()->json([
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'note' => $note
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Note $note): JsonResponse
    {
        // Check if the user owns the note
        if ($request->user()->id !== $note->user_id) {
            return response()->json([
                'message' => 'Unauthorized access'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string'
        ]);

        $note->update($validated);

        return response()->json([
            'message' => 'Note updated successfully',
            'note' => $note
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Note $note): JsonResponse
    {
        // Check if the user owns the note
        if ($request->user()->id !== $note->user_id) {
            return response()->json([
                'message' => 'Unauthorized access'
            ], 403);
        }

        $note->delete();

        return response()->json([
            'message' => 'Note deleted successfully'
        ]);
    }
} 