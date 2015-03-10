# スイカ割れんじゃー at Open Hack Day Japan 3 

## スイカ割れんじゃーとは
* ５人のプレイヤーが協力して１体のロボットを操作し、すいか割りをします。
* 操作はWEBブラウザから行います。いつでも、どこでもすいか割りが楽しめます。
* 各プレイヤーはそれぞれ１方向しか操作できません。５人で息をあわせて操作しましょう。
* ロボットの頭につけられたWEBカメラの映像を見ながら操作します。

[![Alt text for your video](http://img.youtube.com/vi/wXhkQdGJxlk/0.jpg)](http://www.youtube.com/watch?v=wXhkQdGJxlk)

## 仕組み
* GR-001 http://www.hpirobot.jp/gr-001/product/index.html
* VSidoConn4Edison https://github.com/Asratec/VSidoConn4Edison

## 苦労したところ
* WiFiの感度が悪いとEdisonが高負荷になる。
* バッテリーが10分ぐらいしか持たない。１時間充電して１０分デバッグ。24時間しかないHackdayではツラい。
* コマンドが捨てられることがある。リトライ機構の実装。

## お礼
* 夜おそくまで、相談にのってくださったアスラテックのみなさま
* Open Hack Day Japan の事務局の方々
* ありがとうございました
