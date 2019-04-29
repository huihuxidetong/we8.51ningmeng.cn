<?php
defined('YII_ENV') or exit('Access Denied');

use yii\widgets\LinkPager;

$urlManager = Yii::$app->urlManager;
$this->title = '系统更新';
$this->params['active_nav_group'] = 1;
?>
<style>
    .alert {
        border-radius: .15rem;
    }

    .alert-primary {
        color: #004085;
        background-color: #cce5ff;
        border-color: #b8daff;
    }

    .alert-secondary {
        color: #464a4e;
        background-color: #e7e8ea;
        border-color: #dddfe2;
    }

    .alert-success {
        color: #155724;
        background-color: #d4edda;
        border-color: #c3e6cb;
    }

    .alert-dark {
        color: #1b1e21;
        background-color: #d6d8d9;
        border-color: #c6c8ca;
    }
</style>
<div class="panel mb-3">
    <div class="panel-header"><?= $this->title ?></div>
    <div class="panel-body">
        <div class="alert alert-dark p-3" role="alert">当前系统版本：<b>v<?= $res['data']['current_version'] ?></b></div>

        <?php if ($res['data']['next_version']) : ?>
            <div class="alert alert-secondary p-3" role="alert">
                <div class="mb-3">下一版本：<b>v<?= $res['data']['next_version']['version'] ?></b></div>
                <div class="mb-3">发布时间：<b><?= $res['data']['next_version']['update_datetime'] ?></b></div>
                <div>

                    <div><?= $res['data']['next_version']['desc'] ?></div>

            </div>
        <?php else : ?>
            <div class="alert alert-secondary p-3">&#35828;&#38;&#22270;&#38;&#35889;&#38;&#28304;&#38;&#30721;&#25552;&#42;&#37266;</div>
        <?php endif; ?>
    </div>
</div>
</script>