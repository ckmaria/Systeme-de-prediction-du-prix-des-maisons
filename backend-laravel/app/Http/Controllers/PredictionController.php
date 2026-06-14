<?php

namespace App\Http\Controllers;

use App\Models\Prediction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Symfony\Component\Process\Process;
use Throwable;

class PredictionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Prediction::latest()->take(20)->get(),
        ]);
    }

    public function predict(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'surface' => ['required', 'numeric', 'min:10', 'max:2000'],
            'chambres' => ['required', 'integer', 'min:0', 'max:20'],
            'localisation' => ['required', 'string', 'max:100'],
            'type_bien' => ['required', 'string', 'in:Appartement,Maison,Villa,Studio'],
            'etat' => ['required', 'string', 'in:Neuf,Bon,A renover'],
            'facades' => ['required', 'integer', 'min:0', 'max:4'],
            'etage' => ['nullable', 'integer', 'min:0', 'max:60'],
            'ascenseur' => ['required', 'boolean'],
        ]);

        $validated['ascenseur'] = filter_var($validated['ascenseur'], FILTER_VALIDATE_BOOLEAN);
        $validated['etage'] = $validated['etage'] ?? 0;

        try {
            $prixEstime = $this->callPythonModel($validated);

            $prediction = Prediction::create([
                ...$validated,
                'prix_estime' => $prixEstime,
                'payload' => $validated,
            ]);

            return response()->json([
                'prix_estime' => $prediction->prix_estime,
                'message' => 'Prédiction effectuée avec succès',
                'prediction_id' => $prediction->id,
            ], 201);
        } catch (Throwable $exception) {
            $errorMessage = $this->toUtf8($exception->getMessage());

            Log::error('Erreur IA pendant la prediction', [
                'message' => $errorMessage,
                'payload' => $validated,
            ]);

            return response()->json([
                'message' => 'Erreur pendant la prédiction',
                'error' => $errorMessage,
            ], 500);
        }
    }

    private function callPythonModel(array $payload): int
    {
        $pythonBin = env('IA_PYTHON_BIN', 'python');
        $scriptPath = base_path(env('IA_PREDICT_SCRIPT', '../ia/predict.py'));

        if (! file_exists($scriptPath)) {
            throw new RuntimeException("Script IA introuvable: {$scriptPath}");
        }

        $candidates = array_values(array_unique(array_filter([
            $pythonBin,
            'py',
            'python3',
            'python',
        ])));

        $errors = [];
        $processEnv = [
            'PATH' => getenv('PATH') ?: getenv('Path') ?: '',
            'Path' => getenv('Path') ?: getenv('PATH') ?: '',
            'SYSTEMROOT' => getenv('SYSTEMROOT') ?: getenv('SystemRoot') ?: 'C:\\Windows',
            'SystemRoot' => getenv('SystemRoot') ?: getenv('SYSTEMROOT') ?: 'C:\\Windows',
            'PYTHONIOENCODING' => 'utf-8',
        ];

        foreach ($candidates as $candidate) {
            $process = new Process([$candidate, $scriptPath], base_path(), $processEnv);
            $process->setInput(json_encode($payload, JSON_UNESCAPED_UNICODE));
            $process->setTimeout((float) env('IA_TIMEOUT', 30));
            $process->run();

            if (! $process->isSuccessful()) {
                $errors[] = $candidate.': '.$this->toUtf8(trim($process->getErrorOutput()) ?: 'Le script IA a échoué.');

                continue;
            }

            return $this->readPriceFromProcess($process);
        }

        throw new RuntimeException(implode(' | ', $errors));
    }

    private function readPriceFromProcess(Process $process): int
    {
        $decoded = json_decode($process->getOutput(), true);

        if (! is_array($decoded) || ! isset($decoded['prix_estime'])) {
            throw new RuntimeException('Réponse IA invalide: '.$process->getOutput());
        }

        return (int) round($decoded['prix_estime']);
    }

    private function toUtf8(string $message): string
    {
        if (function_exists('mb_check_encoding') && mb_check_encoding($message, 'UTF-8')) {
            return $message;
        }

        foreach (['CP850', 'Windows-1252', 'ISO-8859-1'] as $encoding) {
            $converted = @iconv($encoding, 'UTF-8//IGNORE', $message);

            if (is_string($converted) && $converted !== '') {
                return $converted;
            }
        }

        return 'Erreur technique pendant la prédiction.';
    }
}
