# mobiletwigl


[doxas / twigl](https://github.com/doxas/twigl) をいい感じに携帯で操作できるようにイジイジ素振りするリポジトリ


まずは、通常にclone 作れるように確認


# 📝 2022/01/06


## 描画

シェーダーで、絵も音も出た


### view port

``` .html
meta name="viewport"
    content="width=device-width,initial-scale=0.5,minimum-scale=0.5,maximum-scale=1.0,user-scalable=no">
```


`initial-scale=0.5,minimum-scale=0.5`

`1.0` を`0.5` にして、無理矢理組み込み


## `wkwebview`

キーボードでた時に、view を押し上げる？


# 📝 2022/01/05

[playjs_twigl](https://github.com/pome-ta/playjs_twigl) ここで、node 動きのリポジトリができた


挙動を確認していく



## `onomat.js` のmodule 読み込み

`EventEmitter3` をスーパークラスとしてどうやって読み込むか？


`constructor()` はサウンドシェーダーを選択したら読み込む感じ


今のところは、`EventEmitter3` を呼び出すことはないが、`super()` があるので無視はできない



# 📝 2022/01/02

webpack したものを突っ込んで、読み取れるようにはした

# 📝 2021/12/30

それぞれの挙動を確認せな


# 📝 2021/12/29


npm で管理するものと、ソースを持つものの整理
