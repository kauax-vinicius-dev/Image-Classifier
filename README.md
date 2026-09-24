# Classificador de imagens na AWS

Ao enviar uma foto para o S3, uma função Lambda pede ao Rekognition para classificá-la e salva o resultado no DynamoDB. Um visualizador em HTML mostra essa classificação de forma legível.

![Diagrama da arquitetura](img/diagrama.jpeg)

## Como funciona

1. O usuário envia uma imagem para o **Amazon S3**.
2. O S3 dispara o evento que aciona a **AWS Lambda**.
3. A Lambda envia a imagem ao **Amazon Rekognition**, que retorna objetos, categorias e níveis de confiança.
4. A Lambda salva o resultado no **Amazon DynamoDB**.

## Estrutura

```
.
├── img/
│   └── diagrama.jpeg
├── lambda/
│   └── index.mjs
├── visualizador-classificacao.html
└── README.md
```

## Item salvo no DynamoDB

| Campo       | Descrição                                        |
| ----------- | ------------------------------------------------ |
| `imageId`   | Caminho completo da imagem, incluindo o bucket   |
| `bucket`    | Nome do bucket S3                                |
| `image`     | Chave da imagem dentro do bucket                 |
| `createdAt` | Data e hora do processamento                     |
| `labels`    | Lista de rótulos com `Name` e `Confidence`       |

## Visualizador

1. Abra o `visualizador-classificacao.html` no navegador.
2. Copie o item no DynamoDB, em formato JSON, e cole no campo de texto.
3. Clique em **Visualizar**.

Os rótulos aparecem ordenados por confiança: verde a partir de 90%, amarelo a partir de 70% e vermelho abaixo disso.
