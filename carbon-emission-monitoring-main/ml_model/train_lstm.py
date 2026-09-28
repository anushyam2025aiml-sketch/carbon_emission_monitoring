import pandas as pd
import numpy as np

from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

# Load dataset
df = pd.read_csv("dataset.csv")

print(df.head())

features = [
    "CO2_ppm",
    "CO_ppm",
    "Temperature_C",
    "Humidity_percent"
]

target = "CO_next_1h"

data = df[features + [target]]

scaler = MinMaxScaler()
scaled = scaler.fit_transform(data)

X = []
y = []

sequence_length = 10

for i in range(sequence_length, len(scaled)):
    X.append(scaled[i-sequence_length:i, :-1])
    y.append(scaled[i, -1])

X = np.array(X)
y = np.array(y)

print("X shape:", X.shape)
print("y shape:", y.shape)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

model = Sequential([
    LSTM(64, input_shape=(X_train.shape[1], X_train.shape[2])),
    Dense(32, activation="relu"),
    Dense(1)
])

model.compile(
    optimizer="adam",
    loss="mse",
    metrics=["mae"]
)

model.fit(
    X_train,
    y_train,
    epochs=10,
    batch_size=32,
    validation_split=0.1
)

loss, mae = model.evaluate(X_test, y_test)

print("Test Loss:", loss)
print("Test MAE:", mae)

model.save("lstm_model.h5")

print("Model saved successfully!")