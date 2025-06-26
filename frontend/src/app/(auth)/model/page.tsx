export default function Model(){
    return(
        <div className="flex flex-col w-full px-2 py-4 text-center">
            <h1 className="w-full text-center font-bold text-2xl mb-2">Die Newsmood KI ✨</h1>
            <h2 className="w-full text-center text-xl my-2">Alles über das Modell</h2>
            <p>Newsmood nutzt zur Analyse der Stimmung in den gescannten Nachrichten ein Sentimentanalyse-Modell. Dieses Modell wurde auf englischen Kommentaren trainiert und ist daher ausschließlich in der Lage, englischsprachige Texte zuverlässig zu analysieren. Aus diesem Grund sind auch alle Nachrichten, die über die NewsAPI geladen werden, auf Englisch.</p>
            <h2 className="w-full text-center text-xl my-2">Zuverlässigkeit und Genauigkeit</h2>
            <p>Das Modell erreicht auf unbekannten (Test-)Daten eine Genauigkeit von etwa <span className="font-bold">70 %</span>. Es sagt dabei einen Stimmungswert zwischen 0.0 (negativ) und 1.0 (positiv) vorher. Zur Berechnung wird eine Regressionsmethode mit einer Sigmoid-Aktivierungsfunktion verwendet. Obwohl normalerweise für einfache Klassifikationsaufgaben eine Softmax-Regression sinnvoller erscheinen würde, habe ich mich aufgrund der Möglichkeit zur Anpassung des Threshold für Sigmoid entschieden. Nur so kann der Benutzer entscheiden, ob er in den Reportings die Stimmung eher positiver oder kritischer beachten will. Die zugrundeliegenden Trainings- und Testdaten weisen eine gaußähnliche Verteilung der Stimmungen rund um den neutralen Bereich auf (Erwartungswert: ca. 0.55).</p>
            <div className="flex w-full flex-col items-center mb-6">
                <img src="/confusion_matrix.png" alt="Confusion Matrix des Modells Bild" className="md:w-1/3"/>
                <small>Confusion Matrix des Modells</small>
            </div>
            <p>Die größte Herausforderung bei der Vorhersage stellt die Stimmung neutral dar. Obwohl bereits ein großer Anteil der Testdaten in dieser Klasse korrekt erkannt wurde (siehe auch F1-Score), ist hier die Wahrscheinlichkeit für eine falsche Vorhersage am höchsten. Positiv fällt dabei auf, dass deutlich weniger Ausreißer auftreten, bei denen eigentlich negative Texte fälschlicherweise als positiv klassifiziert werden – und umgekehrt.</p>
            <div className="flex w-full flex-col items-center my-6">
                <img src="/f1_score.png" alt="F1 Score des Modells Bild" className="md:w-1/3"/>
                <small>F1 Score des Modells</small>
            </div>
            <h2 className="w-full text-center text-xl my-2">Training und Modellarchitektur</h2>
            <p>Um den Fehler auf den Testdaten möglichst gering zu halten, wurden beim Training verschiedene Regularisierungsmethoden eingesetzt, darunter Weight Decay, künstliches Rauschen nach dem Embedding-Layer sowie Early Stopping nach vier Epochen ohne Verbesserungen. Das Modell basiert auf einer LSTM-Architektur und verwendet einen Wortschatz aus den 10.000 am häufigsten genutzten englischen Wörtern. Für die Regression kommt eine Sigmoid-Aktivierungsfunktion im Output-Layer in Kombination mit dem mittleren quadratischen Fehler (MSE) als Verlustfunktion zum Einsatz. Als Optimierungsverfahren wurde der Adam-Optimizer verwendet. Das Training erfolgte mit Mini-Batches.</p>
        
        </div>
    )
}